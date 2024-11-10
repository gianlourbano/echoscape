import { useFetch } from "@/hooks/useFetch";
import { LatLng } from "react-native-maps";
import { cachedFetch } from "../cache/cache";
import { ss_get } from "../secureStore/SStore";
import { fetchOverpass } from "./request";


/*
takes in input coordinates of a POI
returns whether we recommend to the user to geo-tag his audios to it

the criteria of the recommendations are the following:
    - if 0 audios have been already geo-tagged to this POI, we recommend it
*/
export async function isPOIRecommended(coordinate: LatLng): Promise<boolean> {
    let recommendation = false  //declared this way to let the code be expandable if needed

    const nAudiosAssociatedToPOI: number = await getNumberOfAudiosInPoint(coordinate)
    recommendation = recommendation || (nAudiosAssociatedToPOI === 0)

    console.log(`DEBUG [isPOIRecommended] n audios in that poi (lat ${coordinate.latitude}, lng ${coordinate.longitude}): `, nAudiosAssociatedToPOI)

    return recommendation
}


/*
takes in input the coordinates of a point on the map
returns all audios with the same coordinates

useful to retrieve audios associated with a POI
*/
export async function getAudiosFromPoint(coordinate: LatLng) {
    const token = await ss_get("token")
    //TODO: CACHEDFETCH NON HA SENSO NON VA BENE
    const audios = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/all`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    )
    .then(data => data.json())
    .then(data => {
        //console.log("DEBUG [getAudiosFromPoint] /audio/all data: ", data)
        return data
    })
    .then(data => 
        data.filter(audio => 
            audio.latitude == coordinate.latitude && audio.longitude == coordinate.longitude
        )
    ).catch(error => console.log("[getAudiosFromPoint] error fetching audios: ", error))

    console.log("DEBUG [POIsAudios_associations getAudiosFromPoint] audios: ", audios)
    return audios;
}

/*
takes in input the coordinates of a point on the map
returns the number of audios with the same coordinates

useful to count how many audios are associated with a POI
*/
async function getNumberOfAudiosInPoint(coordinate: LatLng): Promise<number> {
    try {
        const audios = await getAudiosFromPoint(coordinate);
        // if result of called function is an array (i.e. the function returned with no problems)
        //return its length, otherwise, return 0
        return Array.isArray(audios) ? audios.length : 0;
    } catch (error) {
        console.error("[getNumberOfAudiosInPoint] error counting audios:", error);
        return 0;
    }
}

/*
takes in input coordinates of a point on the map
returns an array of POIs associated with that point, or, in other words, POIs with that same coordinates

example of output:
[{"id": 5228009868, "lat": 44.4943475, "lon": 11.3364348, "tags": {"addr:city": "Bologna", "addr:street": "Piazza Malpighi", "historic": "memorial", "memorial": "statue", "name": "Colonna dell'Immacolata"}, "type": "node"}]

can be useful to know if a song is associated with any POIs
*/
export async function getPOIsAssociatedToPoint(coordinate: LatLng): Promise<any[]> {
    const { latitude, longitude } = coordinate;

    const radius = 1; // meters

    const query = `
        [out:json];
        node
        ["name"]
        ["historic"]
        (around:${radius}, ${latitude}, ${longitude});
        out body;
    `;

    try {
        const data = await fetchOverpass(query);

        if (data && data.elements) {
            const matchingPOIs = data.elements.filter((element) => {
                return (
                    element.lat === latitude && element.lon === longitude
                );
            });
            return matchingPOIs;

        } else {
            return [];
        }
    } catch (error) {
        console.error("[getPOIsAssociatedToPoint] Errore durante il fetch dei POI:", error);
        return [];
    }
}