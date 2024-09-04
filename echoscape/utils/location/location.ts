import * as Location from "expo-location";
import { useEffect, useState } from "react";

/*
returns null if the permissions are not granted
*/
export async function getCurrentPosition(): Promise<Location.LocationObject | null> {
    let location: Location.LocationObject | null = null;
    let status = "";
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
        let result = await Location.requestForegroundPermissionsAsync();
        status = result.status;
    }
    if (permission.granted || status == "granted") {
        location = await Location.getCurrentPositionAsync({});
    }

    return location;
}

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        (async () => {
            let status = "";
            let permission = await Location.getForegroundPermissionsAsync();
            if (!permission.granted) {
                let result = await Location.requestForegroundPermissionsAsync();
                status = result.status;
            }
            if (permission.granted || status == "granted") {
                subscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.Highest },
                    (loc) => {
                        console.log("USER MOVED HIS ASS!");
                        setLocation(loc);
                    }
                );
            }
        })();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    return location;
};
