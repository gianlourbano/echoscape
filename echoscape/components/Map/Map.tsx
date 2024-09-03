import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Details, Marker, Polyline, Region } from "react-native-maps";
import { LocationObject } from "expo-location";
import { getCurrentPosition } from "@/utils/location/location";
import { useAuth } from "@/utils/auth/AuthProvider";
import { getZoomLevel } from "@/utils/map/mapUtils";
import { composeAudiosToFetchArray } from "@/utils/markers/audioAll";
import { cachedFetch } from "@/utils/cache/cache";
import { createMapMarker, getAudioId, MapMarkerInfo } from "@/utils/markers/mapMarkers";
import { useFetch } from "@/hooks/useFetch";

/*
piazza medaglie d'oro
44.505376, 11.343215

incrocio a caso in via san mamolo
44.485377, 11.339487
*/

const MapComponent = ({ initialLatitude, initialLongitude }) => {
    const [region, setRegion] = useState({
        latitude: 44.485377,
        longitude: 11.339487,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        if (initialLatitude && initialLongitude)
            setRegion({
                latitude: initialLatitude,
                longitude: initialLongitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
    }, [initialLatitude, initialLongitude]);

    const [routeCoordinates, setRouteCoordinates] = useState([]);

    const [userLocation, setLocation] = useState<LocationObject | null>();

    const [markers, setMarkers] = useState<MapMarkerInfo[]>([]);

    //ids, lat and lng of all audios
    const [audioAllArray, setAudioAllArray] = useState<MapMarkerInfo[]>([]);

    //all audios - audios out of map borders - audios which data are already in cache
    const [audiosToFetch, setAudiosToFetch] = useState<MapMarkerInfo[]>([]);

    const { withAuthFetch } = useAuth();

    const addMapMarker = useCallback((lat: number, lng: number, id: string) => {
        setMarkers((prev) => [...prev, createMapMarker(lat, lng, id)]);
    }, []);


    async function handleRegionChange(region: Region, details: Details): Promise<void> {
        if (details.isGesture) {
            const DEBUG = true
            if (DEBUG) {
                console.log(`map moved to lat: ${region.latitude}, lng: ${region.longitude} - user prompt movement: ${details.isGesture}`)
                console.debug(`zoomLevel: ${getZoomLevel(region)}`)        
            }
            setRegion(region)
            
            const zoomLevel = getZoomLevel(region)
            if (zoomLevel >= 14) {
                setAudiosToFetch(await composeAudiosToFetchArray(region, audioAllArray))
            }
        }
    }

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
            const processedData = data.map((item) => {
                let id = ""
                if (item.id) {
                    id = item.id ? (item.id[0] == 'm' ? item.id : `marker-audio:${item.id}`) : `marker-audio:undefined`;
                }
                return {
                    position: {
                        lat: item.latitude ?? 0,
                        lng: item.longitude ?? 0,
                    },
                    markerId: id
                };
            });

            //setMarkers(processedData);

            setAudioAllArray(processedData);
            processedData.forEach((item) => {addMapMarker(item.position.lat, item.position.lng, `marker-audio:${item.markerId}`);});
        })();
    }, []);

    /*
        fetches and loads into cache one audio data at a time, while the user sees the correspondent marker on the map, if the map is zoomed enough
    */
    useEffect(() => {
        /*
            every x milliseconds, enrich the the cache by sending a single request to the backend
            send a request for every audio inside map borders which informations aren't already in cache
            stop the execution of the function in either of these occurences:
                - the array is exhausted (index reaches array length)
                - the array gets recalculated due to user moving in the map, 
                (which in turn triggers a new execution of the function on another instance of the array)
                - the user moves to a zone with no audios to fetch (the array length is 0)
        */
        let index = 0;
        const intervalId = setInterval(() => {
            console.log("useeffect richiesta canzoni, index: ", index, " array length: ", audiosToFetch.length);
            if (audiosToFetch.length !== 0 && index < audiosToFetch.length) {
                console.log(`DEBUG////////// sending request: ${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${getAudioId(audiosToFetch[index].markerId)}`)
                withAuthFetch(
                    `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${getAudioId(audiosToFetch[index].markerId)}`,
                    undefined,
                    cachedFetch
                );


                index++;
            } else {
                console.log("useeffect richiesta canzoni, cancello intervallo (else)");
                clearInterval(intervalId);
            }
        }, 1000);

        return () => {
            console.log("useeffect richiesta canzoni, cancello intervallo (return)");
            clearInterval(intervalId);
        };
    }, [audiosToFetch]);

    const fetchRoute = async (startLat, startLng, endLat, endLng) => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_OSRM_API_URL}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
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

    // pokemon go style circle
    // const [radius, setRadius] = useState(0);

    // useEffect(() => {
    //     // expand the circle every 5 seconds from 0 to 100 meters
    //     let radius = 0;
    //     const interval = setInterval(() => {
    //         radius += 2;
    //         if (radius > 100) {
    //             radius = 0;
    //         }
    //         setRadius(radius);
    //     }, 25);
    //     return () => clearInterval(interval);
    // }, [location])

    return (
        <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={handleRegionChange}
        >
            {userLocation ? (
                <Marker
                    coordinate={{
                        latitude: userLocation?.coords.latitude ?? 0,
                        longitude: userLocation?.coords.longitude ?? 0,
                    }}
                />
            ) : null}

            {markers.map((marker) =>
            (<Marker
                    key={marker.markerId}
                    coordinate={{latitude: marker.position.lat, longitude: marker.position.lng}}
                    icon={marker.icon}
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