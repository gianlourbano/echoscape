import { LatLng } from "leaflet";
import { MapMarker } from "@charlespalmerbf/react-native-leaflet-js";

export function createMapMarker(
    lat: number,
    lng: number,
    icon?: number,
    size?: number[]
): MapMarker;
export function createMapMarker(
    position: LatLng,
    icon?: number,
    size?: number[]
): MapMarker;

/*
serve più che altro a non dover copiare e incollare tutte le volte le emoji
size impostato di default a [32, 32]
*/
export function createMapMarker(
    latOrPosition: number | LatLng,
    lngOrIcon?: number | undefined,
    iconOrSize?: number | number[],
    size?: number[]
): MapMarker {
    let lat: number;
    let lng: number;
    let icon: number | undefined;

    if (typeof latOrPosition === "number" && typeof lngOrIcon === "number") {
        lat = latOrPosition;
        lng = lngOrIcon;
        icon = iconOrSize as number | undefined;
    } else {
        lat = (latOrPosition as LatLng).lat;
        lng = (latOrPosition as LatLng).lng;
        icon = lngOrIcon as number | undefined;
    }

    let selectedIcon = "";
    switch (icon) {
        case 1:
            selectedIcon = `<div className="size-32 bg-red-500"></div>`;
            break;
        //more icons can be added
        default:
            selectedIcon = "📍";
    }

    return {
        position: { lat: lat, lng: lng },
        icon: selectedIcon,
        size: size ? size : [32, 32],
    };
}
