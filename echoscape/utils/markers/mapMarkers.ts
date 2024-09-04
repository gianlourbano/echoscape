import { getMarkerType } from "./markerId";

global.count = 0;

export interface MapMarkerInfo {
    position: { lat: number, lng: number },
    icon: any,
    size: [32, 32],
    markerId: string,
}

/*
takes as input informations about position, id and icon 
id is in the format 'marker-TYPE:ID'
icon isn't needed and can be deduced from id
returns a MapMarkerInfo object
*/
export function createMapMarker(
    lat: number,
    lng: number,
    id?: string,
    icon?: number | string
): MapMarkerInfo {
    let selectedIcon = "";
    if (!icon) {
        icon = getMarkerType(id)
    }
    switch (icon) {
        case 1:
            selectedIcon = `<div className="size-32 bg-red-500"></div>`
            break
        //more icons can be added
        case "own":
            selectedIcon = "👤"
            break
        case "audio":
            selectedIcon = "🎵"
            break
        case "poi":
            selectedIcon = "🏛️"
            break
        case "audio_group":
            selectedIcon = "🎶"
            break
        default:
            selectedIcon = "📍"
    }


    return {
        position: { lat: lat, lng: lng },
        icon: selectedIcon,
        size: [32, 32],
        markerId: id,
    };
}


/*
audios are identified in the backend by a number
in our map interface the id is in the format marker-TYPE:ID
this function extracts the backend id from the map interface id
note: if a backend id is given as input, it still returns the backend id

takes as input an id
returns the backend interface id, to be used for requests
*/
export function getAudioId(mapMarkerId: string): string {
    const id = mapMarkerId.split(':')[1]
    if (id.includes(':')) console.warn('Warning: getAudioId returned an id containing the : character. Do you have marker ids ending with ":" ?')
    return id ? id : mapMarkerId
}


export function isAudioMarker(marker: MapMarkerInfo): boolean {
    const id = marker.markerId.split('-')[1].split(':')[0]
    return id === 'audio'
}

export function isPOIMarker(marker: MapMarkerInfo): boolean {
    const id = marker.markerId.split('-')[1].split(':')[0]
    return id === 'poi'
}