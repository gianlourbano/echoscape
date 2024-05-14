

import * as Location from "expo-location";


/*
returns null if the permissions are not granted
*/
export async function getCurrentPosition(): Promise<Location.LocationObject | null> {
    let location: Location.LocationObject | null = null
    let status = ""
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
        let result = await Location.requestForegroundPermissionsAsync();
        status = result.status
    }
    if (permission.granted || status == "granted") {
        location = await Location.getCurrentPositionAsync({});
    }

    return location

}