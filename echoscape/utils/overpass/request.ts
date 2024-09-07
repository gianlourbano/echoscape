import { useCallback, useEffect, useRef } from "react";
import { BBox, Region } from "../markers/types";
import { useFetch } from "@/hooks/useFetch";
import { coordsToGeoJSONFeature, regionToBBox } from "../markers/utils";
import useSWRMutation from "swr/mutation";
import { getZoomLevel } from "../map/mapUtils";

/*
https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide

Bounding box clauses always start with the lowest latitude (southernmost) followed by lowest longitude (westernmost), then highest latitude (northernmost) then highest longitude (easternmost). Note that this is different from the ordering in the XAPI syntax. 
*/
export async function sendOverpassRequest(
    bbox: 
        {minLat: number, minLon: number, maxLat: number, maxLon: number},
    timeout: number = 10,
    ) {
    console.info("richiesta a overpass")

    const body = "data="+ encodeURIComponent(`
                [bbox:${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon}]
                [out:json]
                [timeout:${timeout}]
                ;
                
                    node
                    ["historic"~"."]
                    ["name"];
                    
                
                out geom;
            `)
    var result = await fetch(
        process.env.EXPO_PUBLIC_OVERPASS_API_URL,
        {
            method: "POST",
            // The body contains the query
            // to understand the query language see "The Programmatic Query Language" on
            // https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
            body: body
        },
    ).then(
        (data)=>data.json()
    )

    //console.info("risposta di overpass: ", result.elements)

    //console.log("DEBUG OVERPASS: ", result)

    return result.elements;
}




function pickOneSkipTwo<T>(array: T[]): T[] {
    return array.filter((_, index) => index % 4 === 0);
}

export function createOverpassPathQuery(path, radius = 100) {
    let query = '[out:json];(';

    const pathCopy = path.length > 10 ? pickOneSkipTwo(path) : path
    
    pathCopy.forEach(([lon, lat]) => {
        query += `
        node["historic"~"."]["name"](around:${radius}, ${lat}, ${lon});
        `;
    });

    // Chiude la query
    query += ');out body;';
    
    console.log("richiesta a overpass: ", query)

    return query;
}


// Funzione per inviare la richiesta ad Overpass API
export async function fetchOverpass(query) {
    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = await response.json();
        console.log(data); // Stampa i dati ottenuti dalla richiesta
        return data;
    } catch (error) {
        console.error("Errore nella richiesta Overpass:", error);
    }
}

const hasBBoxChangedSignificantly = (prevBBox, newBBox, threshold = 0.05) => {
    if (!prevBBox) return true;

    const latDiff =
        Math.abs(prevBBox.north - newBBox.north) / Math.abs(prevBBox.north);
    const lonDiff =
        Math.abs(prevBBox.east - newBBox.east) / Math.abs(prevBBox.east);

    return latDiff > threshold || lonDiff > threshold;
};

export const usePOIs = (region: Region) => {
    const oldBBox = useRef(null);

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
                    
                
                out geom;
            `),
            })
                .then((res) => res.json())
                .then((data) => data.elements)
                .then((elements) => {
                    return elements.map((element, index) => {
                        return coordsToGeoJSONFeature(
                            { lat: element.lat, lng: element.lon },
                            {
                                name: element.tags.name,
                                type: "poi",
                                id: "poi-" + index,
                                wikidata: element.tags.wikidata
                                    ? "https://www.wikidata.org/wiki/" +
                                      element.tags.wikidata
                                    : undefined,
                                wikipedia: element.tags.wikipedia
                                    ? "https://en.wikipedia.org/wiki/" +
                                      element.tags.wikipedia.replace(" ", "_")
                                    : undefined,
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
        const zoomLevel = getZoomLevel(region);
        if (
            !hasBBoxChangedSignificantly(oldBBox.current, newBBox) ||
            zoomLevel < 15
        ) {
            return;
        }
        console.debug(
            "BBox has changed significantly, triggering overpass request"
        );

        oldBBox.current = newBBox;
        trigger(newBBox);
    }, [region]);

    return {
        data,
        isLoading: isMutating,
    };
};
