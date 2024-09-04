import { Region } from "react-native-maps";
import { Dimensions } from "react-native";


/*
https://stackoverflow.com/a/53868257

*/




/*
takes in input a Region (struct from react-native-maps) OR a latitudeDelta and a LongitudeDelta directly, which are the values inside the Region struct
returns a zoom level value, a number usually from ~1 to ~20 (higher value -> smaller viewbox)
*/
export function getZoomLevel(regionOrLatitudeDelta: Region | number, longitudeDelta?: number): number {
    const screenWidth = Dimensions.get('window').width;

    // Region
    if (typeof regionOrLatitudeDelta === 'object') {
        const region = regionOrLatitudeDelta as Region;
        return Math.log2(360 * (screenWidth / 256 / region.longitudeDelta)) + 1;
    } 
    
    // latitudeDelta, longitudeDelta
    else if (typeof regionOrLatitudeDelta === 'number' && typeof longitudeDelta === 'number') {
        return Math.log2(360 * (screenWidth / 256 / longitudeDelta)) + 1;
    } 
    
    else {
        throw new Error('Invalid arguments: this function accepts either a Region structure or two numbers');
    }
}


export function regionToLatLng(region: Region):
    {
        maxLat: number,
        minLat: number,
        maxLng: number,
        minLng: number
    } 
    {
        
    const maxLat = region.latitude + region.latitudeDelta
    const minLat = region.latitude - region.latitudeDelta
    const maxLng = region.longitude + region.longitudeDelta
    const minLng = region.longitude - region.longitudeDelta

    return ({
        maxLat: maxLat,
        minLat: minLat,
        maxLng: maxLng,
        minLng: minLng
    })
}