import { Region } from "react-native-maps";
import { inCache } from "../cache/cache";

export async function audioAllRequest(
    token: string
): Promise<backendAudioAllData[]> {
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

    return data as backendAudioAllData[];
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
    array: backendAudioAllData[],
    maxLat: number,
    minLat: number,
    maxLng: number,
    minLng: number
) {
    const filteredArray = array.filter((element) => {
        return (
            maxLat >= element.lat &&
            minLat <= element.lat &&
            maxLng >= element.lng &&
            minLng <= element.lng
        );
    });

    return filteredArray;
}

/*
returns all audios inside the box - no backed information, only position and id
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
    allAudiosArray: backendAudioAllData[]
) {

    const maxLat = region.latitude + region.latitudeDelta
    const minLat = region.latitude - region.latitudeDelta
    const maxLng = region.longitude + region.longitudeDelta
    const minLng = region.longitude - region.longitudeDelta

    //LOG//console.log("composeAudiosToFetchArray eseguita lat: ", maxLat, minLat, " lng ", maxLng, minLng );


    if (allAudiosArray.length !== 0) {
        const visibleAudios = filterAllAudios(
            allAudiosArray,
            maxLat,
            minLat,
            maxLng,
            minLng
        );
        //LOG//console.log("composeAudiosToFetchArray visibleAudios: ",visibleAudios);
        const notCachedAudios = await Promise.all(
            visibleAudios.map((item) => inCache(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${item.id}`))
        );
        //LOG//console.log("composeAudiosToFetchArray notCachedAudios: ", notCachedAudios);
        return(allAudiosArray.filter((item, index) => !notCachedAudios[index]));
        //LOG//console.log("composeAudiosToFetchArray array: ",audioAllArray.filter((item, index) => !notCachedAudios[index]));
    }
}