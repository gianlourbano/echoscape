import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { LocationObject } from "expo-location";
import { getCurrentPosition } from "@/utils/location/location";
import { useAuth } from "@/utils/auth/AuthProvider";

/*
piazza medaglie d'oro
44.505376, 11.343215

incrocio a caso in via san mamolo
44.485377, 11.339487
*/

const MapComponent = () => {
    const [region, setRegion] = useState({
        latitude: 44.485377,
        longitude: 11.339487,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [routeCoordinates, setRouteCoordinates] = useState([]);

    const [location, setLocation] = useState<LocationObject | null>(null);

    const [markers, setMarkers] = useState<{lat: number, lng: number, id: string}[]>([]);

    const { withAuthFetch } = useAuth();

    useEffect(() => {
        getCurrentPosition().then((loc) => {
            setLocation(loc);

            // const { latitude, longitude } = loc.coords;

            // setRegion({
            //     ...region,
            //     latitude,
            //     longitude,
            // });
            // fetchRoute(latitude, longitude, 44.505376, 11.343215); // Example coordinates for point B
        });

        (async () => {
            const response = await withAuthFetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/all`
            );
            const data = await response.json();
            const processedData = data.map((item) => ({
                lat: item.latitude,
                lng: item.longitude,
                id: `marker-audio:${item.id}`
            }));

            setMarkers(processedData);
        })();

    }, []);

    const fetchRoute = async (startLat, startLng, endLat, endLng) => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_OSRM_API_URL}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2))
            const routeCoords = data.routes[0].geometry.coordinates.map(
                (point) => ({
                    latitude: point[1],
                    longitude: point[0],
                })
            );
            setRouteCoordinates(routeCoords);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
        >
            <Marker
                coordinate={{latitude: location?.coords.latitude, longitude: location?.coords.longitude}}
            />
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    coordinate={{latitude: marker.lat, longitude: marker.lng}}
                />
            ))}
            {/* <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor="blue"
            /> */}
        </MapView>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapComponent;
