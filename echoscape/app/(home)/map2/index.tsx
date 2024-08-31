import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { LocationObject } from "expo-location";
import { getCurrentPosition } from "@/utils/location/location";

const OSRM_API_URL = "http://router.project-osrm.org/route/v1/driving";

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

    useEffect(() => {
        getCurrentPosition().then((loc) => {
            setLocation(loc);

            const { latitude, longitude } = loc.coords;

            setRegion({
                ...region,
                latitude,
                longitude,
            });
            fetchRoute(latitude, longitude, 44.505376, 11.343215); // Example coordinates for point B
        });
    }, []);

    const fetchRoute = async (startLat, startLng, endLat, endLng) => {
        try {
            const response = await fetch(
                `${OSRM_API_URL}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
            );
            const data = await response.json();
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
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
            >
                <Marker
                    coordinate={{
                        latitude: region.latitude,
                        longitude: region.longitude,
                    }}
                >
                    <View>
                        <Text>Sborra</Text>
                    </View>
                </Marker>
                <Marker
                    coordinate={{ latitude: 44.485377, longitude: 11.339487 }}
                />
                <Polyline
                    coordinates={routeCoordinates}
                    strokeWidth={4}
                    strokeColor="blue"
                />
            </MapView>
        </View>
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
