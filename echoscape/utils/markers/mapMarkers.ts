import { LatLng } from "leaflet";
import { MapMarker } from "@charlespalmerbf/react-native-leaflet-js";
import { getMarkerType } from "./markerId";

global.count = 0;

/*
serve più che altro a non dover copiare e incollare tutte le volte le emoji
size impostato di default a [32, 32]
*/
export function createMapMarker(
    lat: number,
    lng: number,
    id?: string,
    icon?: number | string
): MapMarker {
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
        id: id,
    };
}
