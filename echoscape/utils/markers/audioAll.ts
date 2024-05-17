

export async function audioAllRequest(token: string): Promise<backendAudioAllData[]> {
    const response = await fetch('http://130.136.2.83/audio/all', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        console.error(`utils/markers/audioAll/audioAllRequest: HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data as backendAudioAllData[];
}


/*
{"_northEast": {"lat": 37.42879682002395, "lng": -122.07544326782228}, "_southWest": {"lat": 37.41516379016069, "lng": -122.09312438964844}}
*/

interface backendAudioAllData {
    id: string
    lat: number
    lng: number
}

export function filterAllAudios(
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


export async function fetchAudiosInBounds(
    maxLat: number,
    minLat: number,
    maxLng: number,
    minLng: number,
    token: string
) {
    return filterAllAudios(
        await audioAllRequest(token),
        maxLat, minLat, maxLng, minLng
    )
}