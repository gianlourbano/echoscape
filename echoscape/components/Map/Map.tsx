import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, {
    Callout,
    Details,
    Marker,
    Polyline,
    Region,
} from "react-native-maps";
import { LocationObject } from "expo-location";
import { getCurrentPosition, useLocation } from "@/utils/location/location";
import { useAuth } from "@/utils/auth/AuthProvider";
import { getZoomLevel, regionToLatLng } from "@/utils/map/mapUtils";
import { composeAudiosToFetchArray } from "@/utils/markers/audioAll";
import { cachedFetch } from "@/utils/cache/cache";
import {
    createMapMarker,
    getAudioId,
    MapMarkerInfo,
} from "@/utils/markers/mapMarkers";
import { useFetch } from "@/hooks/useFetch";
import { debounce } from "@/utils/utils";
import { sendOverpassRequest } from "@/utils/overpass/request";
import { Link, router } from "expo-router";
import { Icon, IconButton } from "react-native-paper";
import { Cluster } from "@/utils/markers/clustering";
import Supercluster, { PointFeature } from "supercluster";

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

    const userLocation = useLocation();

    const [markers, setMarkers] = useState<MapMarkerInfo[]>([]);

    //ids, lat and lng of all audios
    const [audioAllArray, setAudioAllArray] = useState<MapMarkerInfo[]>([]);
    const [areMarkersClustering, setAreMarkersClustering] = useState(false);
    const clusterer = useMemo(() => {
        setAreMarkersClustering(true);
        const toBeClustered = audioAllArray.map((item) => {
            return {
                type: "Feature",
                properties: {
                    name: item.markerId,
                    type: item.markerId.split(":")[0].split("-")[1],
                },
                geometry: {
                    type: "Point",
                    coordinates: [item.position.lng, item.position.lat],
                },
            };
        });
        const c = new Supercluster({
            // @ts-ignore
        }).load(toBeClustered);

        setAreMarkersClustering(false);
        return c;
    }, [audioAllArray]);

    //all audios - audios out of map borders - audios which data are already in cache
    const [audiosToFetch, setAudiosToFetch] = useState<MapMarkerInfo[]>([]);

    const [clusters, setClusters] = useState<Cluster[]>([]);

    const { withAuthFetch } = useAuth();

    const addMapMarker = useCallback((lat: number, lng: number, id: string) => {
        setMarkers((prev) => {
            const markerExists = prev.some((marker) => marker.markerId === id);
            if (markerExists) {
                return prev;
            }
            return [...prev, createMapMarker(lat, lng, id)];
        });
    }, []);

    const debounceFetchPOIs = debounce(
        async (
            bbox: {
                minLat: number;
                minLng: number;
                maxLat: number;
                maxLng: number;
            },
            timeout?: number
        ) => {
            const result = await sendOverpassRequest(
                {
                    minLat: bbox.minLat,
                    maxLat: bbox.maxLat,
                    minLon: bbox.minLng,
                    maxLon: bbox.maxLng,
                },
                timeout
            );
            const newPOIs = result.map((item) =>
                createMapMarker(
                    item.lat,
                    item.lon,
                    `marker-poi:${item.id}`,
                    "poi"
                )
            );

            const total = [...markers, ...newPOIs];
            // filter out duplicates
            const unique = total.filter(
                (v, i, a) => a.findIndex((t) => t.markerId === v.markerId) === i
            );

            setMarkers(unique);

            //console.log("DEBUG NEW POIs: ", newPOIs)
            //console.log("DEBUG markers: ", markers)
        },
        3000
    );

    async function handleRegionChange(
        region: Region,
        details: Details
    ): Promise<void> {
        if (details.isGesture !== false) {
            const DEBUG = true;
            if (DEBUG) {
                console.debug(`map moved to lat: ${region.latitude}, lng: ${region.longitude} - user prompt movement: ${details.isGesture} zoomLevel: ${getZoomLevel(region)}`);
            }
            setRegion(region);

            const zoomLevel = getZoomLevel(region);
            // if (zoomLevel >= 14) {
            //     setAudiosToFetch(
            //         await composeAudiosToFetchArray(region, audioAllArray)
            //     );
            // }
            // if (zoomLevel >= 15) {
            //     debounceFetchPOIs(regionToLatLng(region));
            // }

            const bbox = [
                region.longitude - region.longitudeDelta,
                region.latitude - region.latitudeDelta,
                region.longitude + region.longitudeDelta,
                region.latitude + region.latitudeDelta,
            ];

            const zoom = getZoomLevel(region);

            // @ts-ignore
            const clustered = clusterer.getClusters(bbox, zoom);
            //console.log(clustered);
            const processedClusters = clustered.map((item) => {
                return {
                    center: {
                        lat: item.geometry.coordinates[1],
                        lng: item.geometry.coordinates[0],
                    },
                    count: item.properties.point_count,
                    properties: item.properties,
                    type: item.geometry.type,
                };
            });
            setClusters(processedClusters);
        }
    }

    useEffect(() => {
        // getCurrentPosition().then((loc) => {
        //     setLocation(loc);

        //     // const { latitude, longitude } = loc.coords;

        //     // setRegion({
        //     //     ...region,
        //     //     latitude,
        //     //     longitude,
        //     // });
        //     // fetchRoute(latitude, longitude, 44.505376, 11.343215); // Example coordinates for point B
        // });
 
        (async () => {
            const response = await withAuthFetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/all`
            );
            const data = await response.json();
            const processedData = data.map((item) => {
                let id = "";
                if (item.id) {
                    id = item.id
                        ? item.id[0] == "m"
                            ? item.id
                            : `marker-audio:${item.id}`
                        : `marker-audio:undefined`;
                }
                return {
                    position: {
                        lat: item.latitude ?? 0,
                        lng: item.longitude ?? 0,
                    },
                    markerId: id,
                };
            });

            //setMarkers(processedData);

            setAudioAllArray(processedData);
            processedData.forEach((item) => {
                addMapMarker(
                    item.position.lat,
                    item.position.lng,
                    `${item.markerId}`
                );
            });
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
            if (audiosToFetch.length !== 0 && index < audiosToFetch.length) {
                console.log(
                    `prefetching ${audiosToFetch[index].markerId}, song n.${index} of the ${audiosToFetch.length} waiting in queue`
                );
                withAuthFetch(
                    `${
                        process.env.EXPO_PUBLIC_BACKEND_BASE_URL
                    }/audio/${getAudioId(audiosToFetch[index].markerId)}`,
                    undefined,
                    cachedFetch
                );

                index++;
            } else {
                console.debug(
                    "useeffect richiesta canzoni, cancello intervallo (else)"
                );
                clearInterval(intervalId);
            }
        }, 100);

        return () => {
            console.debug(
                "useeffect richiesta canzoni, cancello intervallo (return)"
            );
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
            //showsUserLocation={true}
            showsMyLocationButton={true}
            showsPointsOfInterest={false}
            onLongPress={(e) =>
                console.log(JSON.stringify(e.nativeEvent, null, 2))
            }
            onPoiClick={(e) =>
                console.log(JSON.stringify(e.nativeEvent, null, 2))
            }
        >
            {userLocation ? (
                <Marker
                    coordinate={{
                        latitude: userLocation?.coords.latitude ?? 0,
                        longitude: userLocation?.coords.longitude ?? 0,
                    }}
                >
                    <IconButton icon="language-cpp" size={40}></IconButton>
                </Marker>
            ) : null}

            {/* {markers.map((marker) => (
                <Marker
                    key={marker.markerId}
                    coordinate={{
                        latitude: marker.position.lat,
                        longitude: marker.position.lng,
                    }}
                    icon={marker.icon}
                >
                    <Text className="text-4xl">{marker.icon}</Text>
                </Marker>
            ))} */}

            <Marker
                key="casa-del-patron"
                coordinate={{
                    latitude: 44.49438,
                    longitude: 11.363488,
                }}
            >
                <IconButton icon="language-haskell" size={40}></IconButton>
            </Marker>
            <Marker
                key="casa-dei-presi-a-male"
                coordinate={{
                    latitude: 44.478343,
                    longitude: 11.367605,
                }}
            >
                <IconButton icon="matrix" size={40}></IconButton>
            </Marker>

            {clusters.map((cluster, index) => {
                return (
                    <Marker
                        key={
                            cluster.properties.cluster_id ??
                            cluster.properties.name
                        }
                        coordinate={{
                            latitude: cluster.center.lat,
                            longitude: cluster.center.lng,
                        }}
                        stopPropagation
                    >
                        {cluster.properties.cluster ? (
                            <Icon source="playlist-music" size={40}></Icon>
                        ) : (
                            <IconButton
                                icon={
                                    cluster.properties.type === "audio"
                                        ? "music-note"
                                        : "pokemon-go"
                                }
                                size={40}
                                onPress={() => {
                                    cluster.properties.type ==="audio" && router.navigate(
                                        `/song/${getAudioId(
                                            cluster.properties.name
                                        )}`
                                    );
                                }}
                            ></IconButton>
                        )}
                        {!areMarkersClustering &&
                            cluster.properties.cluster && (
                                <Callout style={{ width: "auto" }}>
                                    <View className="flex flex-col gap-2">
                                        {clusterer
                                            .getLeaves(
                                                cluster.properties.cluster_id,
                                                Infinity
                                            )
                                            .map((leaf) => (
                                                <Link
                                                    href={`/song/${getAudioId(
                                                        leaf.properties.name
                                                    )}`}
                                                    key={leaf.properties.name}
                                                >
                                                    Audio #
                                                    {
                                                        leaf.properties.name.split(
                                                            ":"
                                                        )[1]
                                                    }
                                                </Link>
                                            ))}
                                    </View>
                                </Callout>
                            )}
                    </Marker>
                );
            })}
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
