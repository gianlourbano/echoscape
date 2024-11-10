import { Fragment, memo, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MapMarkerProps, MapPressEvent } from "react-native-maps";
import {
    LatLng,
    Marker,
    Polyline,
    PROVIDER_GOOGLE,
    UrlTile,
} from "react-native-maps";
import MapView from "react-native-maps";
import { useClusterer } from "@/utils/markers/clustering";
import { useFetch } from "@/hooks/useFetch";
import { IconButton } from "react-native-paper";
import { coordsToGeoJSONFeature, isPointCluster } from "@/utils/markers/utils";
import { memes } from "@/utils/markers/memes";
import { usePOIs } from "@/utils/overpass/request";
import { ClusterMarker, render } from "./Markers";
import DirectionsSelector from "./DirectionsSelector";
import POIListModal from "../MarkerModals/POIListModal";
import { POICardProps } from "../MarkerModals/POICard";
import { useLocation } from "@/utils/location/location";
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeOutUp,
} from "react-native-reanimated";
import { getZoomLevel, regionToLatLng } from "@/utils/map/mapUtils";
import { cachedFetch, inCache } from "@/utils/cache/cache";
import { composeAudiosToFetchArray } from "@/utils/markers/audioAll";
import { useAuth } from "@/utils/auth/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MemoizedMarker = memo(
    ({ coordinate, children, ...props }: MapMarkerProps) => {
        return (
            <Marker coordinate={coordinate} {...props}>
                {children}
            </Marker>
        );
    }
);

export default function ClusteredMap({
    latitude: initialLatitude,
    longitude: initialLongitude,
}: LatLng) {
    const loc = useLocation();

    const [region, setRegion] = useState({
        latitude: 44.485377,
        longitude: 11.339487,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [showAudios, setShowAudios] = useState(true);
    const [showPOIs, setShowPOIs] = useState(true);

    const [onMapPressMarkerCoordinates, setOnMapPressMarkerCoordinates] =
        useState<LatLng | null>(null);
    const [showDirectionsMenu, setShowDirectionsMenu] =
        useState<boolean>(false);
    const [directionsOnMapPressEvent, setDirectionsOnMapPressEvent] =
        useState<LatLng | null>(null);

    const [polylineCoords, setPolylineCoords] = useState<LatLng[]>([]);
    const [directionsMarkers, setDirectionsMarkers] = useState<{
        startingPoint: LatLng;
        endingPoint: LatLng;
    }>({ startingPoint: null, endingPoint: null });

    const [showPoiList, setShowPoiList] = useState<boolean>(false);
    const [poiListData, setPoiListData] = useState<POICardProps[]>([]);

    useEffect(() => {
        console.log("ClusteredMap component mounted with in");
        if (initialLatitude && initialLongitude)
            setRegion({
                latitude: initialLatitude,
                longitude: initialLongitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
    }, [initialLatitude, initialLongitude]);

    const { data, isLoading, error } = useFetch("/audio/all", {
        cache: false,
        postProcess: (data) => {
            return data.map((marker) =>
                coordsToGeoJSONFeature(
                    { lat: marker.latitude, lng: marker.longitude },
                    {
                        name: `Audio #${marker.id}`,
                        type: "audio",
                        id: `audio-${marker.id}`,
                    }
                )
            );
        },
    });

    const { data: POIs, isLoading: POIsLoading } = usePOIs(region);

    const [genreFilter, setGenreFilter] = useState<string | null>("rock");

    const { withAuthFetch } = useAuth();

    const applyTransform = useCallback(
        (data, pois) => {
            if (!data || !pois) return [];

            let filteredData = [...data];
            let final = [];
            // if (genreFilter) {
            //     data.forEach((item) => {
            //         // get from cache
            //         const id = item.properties.id.split("-")[1];

            //         const url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${id}`;

            //         const data = AsyncStorage.getItem(url);

            //         data.then((value) => {
            //             if (value) {
            //                 const audio = JSON.parse(value);
            //                 if (audio.tags.genre[genreFilter] > 0.1) {
            //                     console.log(audio.tags.genre[genreFilter]);
            //                     final.push(item);
            //                 }
            //             }
            //         });
            //     });
            // }

            return [...filteredData, ...pois, ...memes];
        },
        [data, POIs, region, genreFilter]
    );

    useEffect(() => {
        (async () => {
            if (getZoomLevel(region) > 15) {
                //1 latitude 0 longitude
                //data[0].geometry.coordinates

                //const audiosToFetch = await composeAudiosToFetchArray(region, data)

                const { maxLat, minLat, maxLng, minLng } =
                    regionToLatLng(region);

                const audiosToFetch = data.filter((element) => {
                    return (
                        maxLat >= element.geometry.coordinates[1] &&
                        minLat <= element.geometry.coordinates[1] &&
                        maxLng >= element.geometry.coordinates[0] &&
                        minLng <= element.geometry.coordinates[0]
                    );
                });

                audiosToFetch.forEach((item) => {
                    withAuthFetch(
                        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${
                            item.properties.id.split("-")[1]
                        }`,
                        {},
                        cachedFetch
                    );
                });
            }
        })();
    }, [region, data]);

    function onMapPress(event: MapPressEvent) {
        event.persist();
        console.log("event: ", event?.nativeEvent.coordinate ?? "null");

        //triggers directions menu actions if needed
        setDirectionsOnMapPressEvent((prev) => {
            if (event && event.nativeEvent) return event.nativeEvent.coordinate;
            else return null;
        });

        //alternates between putting a marker on the map when pressing it and deleting it when pressing elsewhere
        if (onMapPressMarkerCoordinates) {
            setOnMapPressMarkerCoordinates(null);
        } else {
            setOnMapPressMarkerCoordinates(
                event?.nativeEvent.coordinate ?? null
            );
        }
    }

    function handleDirectionsButtonPress() {
        if (showDirectionsMenu) {
            //directions button is used both as an opener and as a closer when the menu is already open
            handleDirectionsClosePress();
        } else {
            setShowDirectionsMenu(true);
            //setOnMapPressMarkerCoordinates(null)
            setDirectionsMarkers({ startingPoint: null, endingPoint: null });
            setDirectionsOnMapPressEvent(null);
        }
    }

    function handleDirectionsClosePress() {
        setShowDirectionsMenu(false);
        setOnMapPressMarkerCoordinates(null);
        setDirectionsMarkers({ startingPoint: null, endingPoint: null });
        setDirectionsOnMapPressEvent(null);
    }

    function handleMapLongPress(event: MapPressEvent) {
        if (!onMapPressMarkerCoordinates) {
            setOnMapPressMarkerCoordinates(event.nativeEvent.coordinate);
        }
        if (!showDirectionsMenu) {
            handleDirectionsButtonPress();
        }
    }

    function onPOIsFetch(POIs: POICardProps[]) {
        setPoiListData(POIs);
        setShowPoiList(true);
    }

    function handleClosePOIList() {
        setShowPoiList(false);
    }

    const [points, supercluster] = useClusterer(
        applyTransform(showAudios ? data : [], showPOIs ? POIs : []),
        {
            // get viewport dimensions
            width: 1000,
            height: 1000,
        },
        region
    );

    return (
        <Fragment>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsMyLocationButton={true}
                showsPointsOfInterest={false}
                onLongPress={(e) => {
                    console.log(JSON.stringify(e.nativeEvent, null, 2));
                    // @ts-ignore
                    handleMapLongPress(e);
                }}
                showsUserLocation
                onPress={onMapPress}
            >
                {points?.map((point) => (
                    // These should be memoized components,
                    // otherwise you might see flickering
                    <MemoizedMarker
                        key={point.properties.cluster_id || point.properties.id}
                        coordinate={{
                            latitude: point.geometry.coordinates[1],
                            longitude: point.geometry.coordinates[0],
                        }}
                        // ... marker props
                    >
                        {isPointCluster(point) ? (
                            <ClusterMarker
                                point={point}
                                supercluster={supercluster}
                            />
                        ) : (
                            render({ point })
                        )}
                    </MemoizedMarker>
                ))}

                {!showDirectionsMenu && onMapPressMarkerCoordinates ? (
                    <Marker coordinate={onMapPressMarkerCoordinates}></Marker>
                ) : null}

                {showDirectionsMenu && directionsMarkers.startingPoint ? (
                    <Marker coordinate={directionsMarkers.startingPoint} />
                ) : null}
                {showDirectionsMenu && directionsMarkers.endingPoint ? (
                    <Marker coordinate={directionsMarkers.endingPoint} />
                ) : null}

                <Polyline
                    coordinates={polylineCoords}
                    strokeColor="#FF0000" // Colore rosso
                    strokeWidth={5} // Larghezza della linea
                    geodesic={false} // Linea geodetica
                    lineCap="round" // Estremità arrotondate
                    lineJoin="round" // Giunzioni arrotondate
                />
            </MapView>

            <View style={styles.buttons}>
                <IconButton
                    icon={
                        !showAudios
                            ? "music-note-off-outline"
                            : "music-note-outline"
                    }
                    size={40}
                    onPress={() => setShowAudios(!showAudios)}
                ></IconButton>
                <IconButton
                    icon={
                        !showPOIs
                            ? "map-marker-off-outline"
                            : "map-marker-outline"
                    }
                    size={40}
                    onPress={() => setShowPOIs(!showPOIs)}
                ></IconButton>
                <IconButton
                    icon={"directions-fork"}
                    size={40}
                    onPress={handleDirectionsButtonPress}
                ></IconButton>
            </View>

            {showDirectionsMenu ? (
                <Animated.View
                    style={{
                        position: "absolute",
                        top: 0,
                        zIndex: 1,
                        width: "100%",
                    }}
                    entering={FadeInUp}
                    exiting={FadeOutUp}
                >
                    <DirectionsSelector
                        onClose={handleDirectionsClosePress}
                        onMapPressEventCoords={directionsOnMapPressEvent}
                        onRouteCompute={setPolylineCoords}
                        onPOIsFetch={onPOIsFetch}
                        setDirectionsMarkers={setDirectionsMarkers}
                        defaultEndingPoint={onMapPressMarkerCoordinates}
                    />
                </Animated.View>
            ) : null}

            {showPoiList ? (
                <POIListModal
                    visible={showPoiList}
                    onClose={handleClosePOIList}
                    data={poiListData}
                />
            ) : null}
        </Fragment>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    badge: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 1000,
    },
    buttons: {
        position: "absolute",
        bottom: 0,
        right: 0,
    },
});
