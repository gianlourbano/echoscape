import { useCallback, useEffect, useRef, useState } from "react";
import { BBox, Region } from "../markers/types";
import { useFetch } from "@/hooks/useFetch";
import { coordsToGeoJSONFeature, regionToBBox } from "../markers/utils";
import useSWRMutation from "swr/mutation";
import { getZoomLevel } from "../map/mapUtils";
import { LatLng } from "react-native-maps";
import useSWR from "swr";

/*
takes in input a bounding box, fetches overpass and
returns POIs in that area

https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide

Bounding box clauses always start with the lowest latitude (southernmost) followed by lowest longitude (westernmost), then highest latitude (northernmost) then highest longitude (easternmost). Note that this is different from the ordering in the XAPI syntax. 
*/
export async function sendOverpassRequest(
    bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number },
    timeout: number = 10
) {
    console.info("richiesta a overpass");

    const body =
        "data=" +
        encodeURIComponent(`
                [bbox:${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon}]
                [out:json]
                [timeout:${timeout}]
                ;
                    (
                        node["historic"]["name"]({{bbox}});
                        node["tourism"]["name"]["wikipedia"]({{bbox}});
                    );

                    // node
                    // ["historic"~"."]
                    // ["name"];
                    
                
                out geom;
            `);
    var result = await fetch(process.env.EXPO_PUBLIC_OVERPASS_API_URL, {
        method: "POST",
        // The body contains the query
        // to understand the query language see "The Programmatic Query Language" on
        // https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
        body: body,
    }).then((data) => data.json());

    //console.info("risposta di overpass: ", result.elements)

    //console.log("DEBUG OVERPASS: ", result)

    return result.elements;
}

/*
takes in input an array
returns a copy of the array taking only 1 elements every 4. so, a shorter array
*/
function pickOneSkipTwo(array) {
    return array.filter((_, index) => index % 4 === 0);
}

/*
takes in input a path, as an array of coordinates:
    - LatLng objects, {latitude: number, longitude: number}
    - [lon, lat], arrays formed by a pair of numbers. in this case, the longitude goes FIRST, then the latitude
makes the request to overpass API
returns the list of POIs down that route
*/
export function createOverpassPathQuery(
    path: number[][] | LatLng[],
    radius = 100
) {
    let query = "[out:json];(";

    const pathCopy = (path.length > 10 ? pickOneSkipTwo(path) : path).map(
        (element: [number, number] | LatLng) => {
            //checks if the array is formed by
            if (Array.isArray(element)) {
                return element as [number, number];
            } else {
                const latLng = element as LatLng;
                return [latLng.longitude, latLng.latitude];
            }
        }
    );

    pathCopy.forEach(([lon, lat]) => {
        query += `
            node
            ["historic"~"."]
            ["name"]
            (around:${radius}, ${lat}, ${lon});

            node
            ["tourism"~"."]
            ["name"]
            ["wikipedia"]
            (around:${radius}, ${lat}, ${lon});

            node
            ["leisure"~"^
            (park|garden)$"]
            ["name"]
            ["wikipedia"]
            (around:${radius}, ${lat}, ${lon});

            node
            ["building"="government"]
            ["name"]
            ["wikipedia"]
            (around:${radius}, ${lat}, ${lon});

            node
            ["amenity"="place_of_worship"]
            ["name"]
            ["wikipedia"]
            (around:${radius}, ${lat}, ${lon});
        `;
    });

    query += ");out body;";

    console.log("richiesta a overpass: ", query);

    return query;
}

/*
sends to overpass the query in input
returns a promise which in turn becomes overpass response
*/
export async function fetchOverpass(query) {
    try {
        const response = await fetch(process.env.EXPO_PUBLIC_OVERPASS_API_URL, {
            method: "POST",
            body: query,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const data = await response.json();
        //console.log(data);
        return data;
    } catch (error) {
        console.error("Errore nella richiesta Overpass:", error);
    }
}

/*
given two bounding boxes, returns the overlap index
the overlap index represents how much two bounding boxes overlap
it ranges between 0 and 1:
    - 0 for boxes completely separated
    - 1 for total overlap
*/
const calculateOverlapIndex = (bbox1: BBox, bbox2: BBox): number => {
    const [left1, bottom1, right1, top1] = bbox1;
    const [left2, bottom2, right2, top2] = bbox2;

    // no overlap: return 0
    if (left1 >= right2 || left2 >= right1) {
        return 0;
    }
    if (bottom1 >= top2 || bottom2 >= top1) {
        return 0;
    }

    // intersection borders
    const interLeft = Math.max(
        Math.min(right1, left2),
        Math.min(left1, right2)
    );
    const interRight = Math.min(
        Math.max(right1, left2),
        Math.max(left1, right2)
    );
    const interBottom = Math.max(
        Math.min(top1, bottom2),
        Math.min(bottom1, top2)
    );
    const interTop = Math.min(Math.max(top1, bottom2), Math.max(bottom1, top2));

    // intersection area
    const interWidth = Math.abs(interRight - interLeft);
    const interHeight = Math.abs(interTop - interBottom);
    const interArea = interWidth * interHeight;

    // union area
    const area1 = (right1 - left1) * (top1 - bottom1);
    const area2 = (right2 - left2) * (top2 - bottom2);
    const unionArea = area1 + area2 - interArea;

    return unionArea === 0 ? 0 : interArea / unionArea;
};

const hasBBoxChangedSignificantly = (prevBBox, newBBox, threshold = 0.2) => {
    if (!prevBBox) return true;
    /*
    const latDiff =
        Math.abs(prevBBox[3] - newBBox[3]) / Math.abs(prevBBox[3]);
    const lonDiff =
        Math.abs(prevBBox[2] - newBBox[2]) / Math.abs(prevBBox[2]);

    //console.log("DEBUG USEPOIS latDiff: ", latDiff, " lonDiff: ", lonDiff)

    return latDiff > threshold || lonDiff > threshold;
*/
    const overlapIndex = calculateOverlapIndex(prevBBox, newBBox);

    return overlapIndex < threshold;
};

export async function getCoordinatesName(
    coords: LatLng | null
): Promise<string> {
    if (!coords) return "";
    const latitude = coords.latitude;
    const longitude = coords.longitude;
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    "User-Agent":
                        "university-project-echoscape (liam.busnelliurso@studio.unibo.it)",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Error fetching coordinates name: ${response.status} ${response.statusText}`
            );
            console.error("Response body: ", errorText);
            return `${latitude}, ${longitude}`;
        }

        const data = await response.json();
        if (data && data.address && data.address.road) {
            return data.address.road;
        } else {
            return `${latitude}, ${longitude}`;
        }
    } catch (error) {
        console.error(
            `Error fetching coordinates name from (${latitude}, ${longitude}):`,
            error
        );
        return `${latitude}, ${longitude}`;
    }
}

export const usePOIs = (region: Region) => {
    const oldBBox = useRef(null);


    // node["amenity"="place_of_worship"]["name"]["wikipedia"];
    // node["historic"]["name"]["wikipedia"];
    // node["tourism"="museum"]["name"]["wikipedia"];
    // node["tourism"="gallery"]["name"]["wikipedia"];
    // node["building"="government"]["name"]["wikipedia"];
    // node["leisure"~"^(park|garden)$"]["name"]["wikipedia"];
    
    const fetcher = useCallback(
        async (url: string | URL, { arg }: { arg: BBox }) => {
            return await fetch(url, {
                method: "POST",
                body:
                    "data=" +
                    encodeURIComponent(`
                [bbox:${arg[1]},${arg[0]},${arg[3]},${arg[2]}]
                [out:json]
                ;
                
                    node
                    ["historic"~"."]
                    ["name"];

                    node
                    ["tourism"~"."]
                    ["name"]
                    ["wikipedia"];

                    node
                    ["leisure"~"^(park|garden)$"]
                    ["name"]
                    ["wikipedia"];

                    node
                    ["building"="government"]
                    ["name"]
                    ["wikipedia"];

                    node["amenity"="place_of_worship"]
                    ["name"]
                    ["wikipedia"];
                
                out tags geom;
            `),
                headers: {
                    "User-Agent":
                        "university-project-echoscape (liam.busnelliurso@studio.unibo.it)",
                },
            })
                .then(data => {
                    console.log("DEBUG DATA.status: ", data.status)
                    console.log("DEBUG DATA.headers: ", data.headers)
                    console.log("DEBUG DATA.body: ", data.body)
                    return data
                })
                .then((res) => res.json())
                .then(data => {console.log("DEBUG DATA RICHIESTA BBOX: ", data); return data})
                .then((data) => data.elements)
                .then((elements) => {
                    return elements.map((element, index) => {
                        return coordsToGeoJSONFeature(
                            { lat: element.lat, lng: element.lon },
                            {
                                name: element.tags.name,
                                type: "poi",
                                id: "poi-" + index,
                                wikidata: element.tags?.wikidata,
                                wikipedia: element.tags?.wikipedia || null
                            }
                        );
                    });
                });
        },
        [region]
    );

    const { data, isMutating, trigger } = useSWRMutation(
        process.env.EXPO_PUBLIC_OVERPASS_API_URL,
        fetcher
    );

    useEffect(() => {
        const newBBox = regionToBBox(region);
        //console.log("DEBUG USEPOIS newBbox: ", newBBox)
        const zoomLevel = getZoomLevel(region);

        if (
            !hasBBoxChangedSignificantly(oldBBox.current, newBBox) ||
            zoomLevel < 15
        ) {
            // console.log("DEBUG USEPOIS: ", hasBBoxChangedSignificantly(oldBBox.current, newBBox), zoomLevel)
            //console.log("DEBUG USEPOIS oldbbox: ", oldBBox.current)
            return;
        }
        else {
            console.debug(
                "BBox has changed significantly, triggering overpass request with"
            );
            trigger(newBBox);
        }

        oldBBox.current = newBBox;
    }, [region]);

    return {
        data,
        isLoading: isMutating,
    };
};

async function fetchWikipediaDescription(title: string, language="it"): Promise<string> {
    if(!title) {
        return "No short description available";
    }

    const url = `https://${language}.wikipedia.org/w/api.php`;

    // Define the API query parameters
    const params = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "extracts",
        exintro: "true", // Get only the introduction (summary)
        description: "true",
        // if : is present in the title, split it and take the string after the :
        titles: title,
    });

    // Send the request to Wikipedia API
    const response = await fetch(`${url}?${params.toString()}`);

    // Ensure the request was successful
    if (!response.ok) {
        throw new Error("Failed to fetch data from Wikipedia");
    }

    // Parse the response as JSON
    const data = await response.json();

    // Extract the page description (first paragraph)
    const page = Object.values(data.query.pages)[0];
    if (!page) {
        return "No short description available";
    }
    // @ts-ignore
    const description = (page.extract as string) || "No short description available";

    return description.replace(/<[^>]*>/g, "");
}

export function useWIKI(wikidataID: string, lang: string) {
    const [wikiurl, setWikiurl] = useState<string | null>(null);
    const [description, setDescription] = useState<string>("No short description available");

    const fetcher = useCallback(async () => {
        if (!wikidataID) {
            setDescription("No short description available");
            return null;
        }

        const baseurl = "https://www.wikidata.org/w/api.php";

        const params = new URLSearchParams();
        params.append("action", "wbgetentities");
        params.append("props", "sitelinks");
        params.append("props", "sitelinks/urls")
        params.append("ids", wikidataID);
        params.append("sitefilter", lang + "wiki");
        params.append("format", "json");

        const response = await fetch(`${baseurl}?${params.toString()}`);
        const data = await response.json();

        if(data.entities) {

            const wikiurl = data.entities[wikidataID].sitelinks[lang + "wiki"]?.url;
            const title = data.entities[wikidataID].sitelinks[lang + "wiki"]?.title;
            setWikiurl(wikiurl);

            const desc = await fetchWikipediaDescription(title, lang);

            setDescription(desc);

            if(desc === "No short description available")
                return "no-desc"

            return "desc";
        }

        return null;

    }, [wikidataID, lang]);

    const { data, isLoading } = useSWR("wikidata", fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        refreshInterval: 0,
    });

    return {
        status: data,
        wikiurl,
        description,
        isLoading,
    };

}

/*
fetches wikipedia image from wikidata
the id given in input should be the wikidata id, usually starting with a "Q"
little tutorial: https://codingtechroom.com/question/how-to-retrieve-image-urls-from-wikidata-items-using-the-api
*/
export async function fetchWikidataImage(id: string): Promise<any | null> {
    const wikidataURL = `https://query.wikidata.org/sparql`;
    const query = `SELECT ?image WHERE {{ wd:${id} wdt:P18 ?image. }}`;
    const params = new URLSearchParams({
        query: query,
        format: "json",
    });
    try {
        const response = await fetch(`${wikidataURL}?${params.toString()}`, {
            headers: {
                "User-Agent":
                    "university-project-echoscape (liam.busnelliurso@studio.unibo.it)",
            },
        });
        if (response.status === 200) {
            const data = await response.json();
            if (data.results.bindings.length > 0) {
                return data.results.bindings[0].image.value;
            } else {
                return null;
            }
        } else {
            console.error(
                `[fetchWikidataImage] error (response ${response.status}) while fetching image from id ${id}: ${response.text} `
            );
            return null;
        }
    } catch (error) {
        console.log(
            `[fetchWikidataImage] error while fetching image from id ${id}: ${error}`
        );
        return null;
    }
}
