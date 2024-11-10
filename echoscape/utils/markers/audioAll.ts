import { Region } from "react-native-maps";
import { inCache } from "../cache/cache";
import { getAudioId, MapMarkerInfo } from "./mapMarkers";
import { regionToLatLng } from "../map/mapUtils";

export async function audioAllRequest(token: string): Promise<MapMarkerInfo[]> {
    const response = await fetch(
        "${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/all",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        console.error(
            `utils/markers/audioAll/audioAllRequest: HTTP error! status: ${response.status}`
        );
    }

    const data = await response.json();

    return data as MapMarkerInfo[];
}

/*
{"_northEast": {"lat": 37.42879682002395, "lng": -122.07544326782228}, "_southWest": {"lat": 37.41516379016069, "lng": -122.09312438964844}}
*/

interface backendAudioAllData {
    id: string;
    lat: number;
    lng: number;
}

/*
takes in input an array of positions and a box
returns an array containing only elements inside the box
*/
function filterAllAudios(
    array: [],
    maxLat: number,
    minLat: number,
    maxLng: number,
    minLng: number
) {
    const filteredArray = array.filter((element) => {
        /*if (0) 
        console.log("DEBUG ", element, (
            maxLat >= element.geometry.coordinates[1] &&
            minLat <= element.geometry.coordinates[1] &&
            maxLng >= element.geometry.coordinates[0] &&
            minLng <= element.geometry.coordinates[0]
        ), "element.position.lat, lng: ", element.position.lat, element.position.lng, "maxLat minLat maxLng minLng", maxLat, minLat, maxLng, minLng)*/
        return (
            maxLat >= element.geometry.coordinates[1] &&
            minLat <= element.geometry.coordinates[1] &&
            maxLng >= element.geometry.coordinates[0] &&
            minLng <= element.geometry.coordinates[0]
        );
    });

    //console.log("DEBUG FILTEREDAARRAY: ", filteredArray)

    return filteredArray;
}

/*
returns all audios inside the box - no backend information, only position and id
*/
export async function fetchAudiosInBounds(
    maxLat: number,
    minLat: number,
    maxLng: number,
    minLng: number,
    token: string
) {
    return filterAllAudios(
        await audioAllRequest(token),
        maxLat,
        minLat,
        maxLng,
        minLng
    );
}

/*
takes in input an array of positions, and a box (a Region struct from react-native-maps)
returns an array containing only elements inside the box that are NOT in cache
*/
export async function composeAudiosToFetchArray(
    region: Region,
    allAudiosArray: []
) {
    const coordinates = regionToLatLng(region);
    const maxLat = coordinates.maxLat;
    const minLat = coordinates.minLat;
    const maxLng = coordinates.maxLng;
    const minLng = coordinates.minLng;

    //LOG//console.log("composeAudiosToFetchArray eseguita lat: ", maxLat, minLat, " lng ", maxLng, minLng );

    if (allAudiosArray.length !== 0) {
        const visibleAudios = filterAllAudios(
            allAudiosArray,
            maxLat,
            minLat,
            maxLng,
            minLng
        );
        console.debug("number of visible audios: ", visibleAudios.length);
        const cachedAudios = await Promise.all(
            visibleAudios.map((item) =>
                inCache(
                    `${
                        process.env.EXPO_PUBLIC_BACKEND_BASE_URL
                    }/audio/${getAudioId(item.properties.id)}`
                )
            )
        );
        //console.log("[composeAudiosToFetchArray] cachedAudios (length: ", cachedAudios.length, "): ", cachedAudios);
        console.debug(
            "[composeAudiosToFetchArray] returns array: ",
            visibleAudios.filter((item, index) => !cachedAudios[index])
        );
        return visibleAudios.filter((item, index) => !cachedAudios[index]);
    }
}
