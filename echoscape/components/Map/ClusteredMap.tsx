import { memo, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, {  LatLng, MapMarkerProps, MapPressEvent, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useClusterer } from "@/utils/markers/clustering";
import { useFetch } from "@/hooks/useFetch";
import {  IconButton } from "react-native-paper";
import { coordsToGeoJSONFeature, isPointCluster } from "@/utils/markers/utils";
import { memes } from "@/utils/markers/memes";
import { usePOIs } from "@/utils/overpass/request";
import { ClusterMarker, render } from "./Markers";
import DirectionsSelector from "./DirectionsSelector";

const MemoizedMarker = memo(
    ({ coordinate, children, ...props }: MapMarkerProps) => {
        return (
            <Marker coordinate={coordinate} {...props}>
                {children}
            </Marker>
        );
    }
);

export default function ClusteredMap({ initialLatitude, initialLongitude }) {
    const [region, setRegion] = useState({
        latitude: 44.485377,
        longitude: 11.339487,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [showAudios, setShowAudios] = useState(true);
    const [showPOIs, setShowPOIs] = useState(true);

    const [onMapPressMarkerCoordinates, setOnMapPressMarkerCoordinates] = useState<{latitude: number, longitude: number} | null>(null)
    const [showDirectionsMenu, setShowDirectionsMenu] = useState<boolean>(false)
    const [directionsOnMapPressEvent, setDirectionsOnMapPressEvent] = useState<LatLng | null>(null)

    const [polylineCoords, setPolylineCoords] = useState<LatLng[]>([])

    useEffect(() => {
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

    const applyTransform = useCallback(
        (data, pois) => {
            if (!data || !pois) return [];

            const radius = 0.0005;

            const newData = [...data];
            const assignedMarkers = [];

            pois.forEach((poi) => {
                const { latitude, longitude } = poi;

                newData.forEach((marker, index) => {
                    const markerLat = marker.geometry.coordinates[1];
                    const markerLng = marker.geometry.coordinates[0];

                    // Calculate the distance between the marker and the point of interest
                    const distance = Math.sqrt(
                        Math.pow(markerLat - latitude, 2) +
                            Math.pow(markerLng - longitude, 2)
                    );

                    // If the marker is within the radius of the point of interest, assign it to the point of interest
                    if (distance <= radius) {
                        assignedMarkers.push(marker);
                        newData.splice(index, 1);
                    }
                });
            });

            return [...data, ...pois, ...memes];
        },
        [data, POIs]
    );

    function onMapPress(event: MapPressEvent) {
        event.persist();
        console.log("event: ", event?.nativeEvent.coordinate ?? "null")

        //triggers directions menu actions if needed
        setDirectionsOnMapPressEvent(prev => {
                                        if (event && event.nativeEvent) return event.nativeEvent.coordinate
                                        else return null
                                    })  

        //alternates between putting a marker on the map when pressing it and deleting it when pressing elsewhere
        if (onMapPressMarkerCoordinates) {
            setOnMapPressMarkerCoordinates(null)
        }
        else {   
            setOnMapPressMarkerCoordinates(event?.nativeEvent.coordinate ?? null)
        }
    }

    function handleDirectionsButtonPress() {
        console.log("DEBUG (rimuovere log) bottone premuto! showDirectionsMenu: ", showDirectionsMenu)
        setShowDirectionsMenu(prev => !prev)
    }


    useEffect(() => {
        console.log("DEBUG clustered map component mounted")

    }, [])

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
    <>
        <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsMyLocationButton={true}
            showsPointsOfInterest={false}
            onLongPress={(e) =>
                console.log(JSON.stringify(e.nativeEvent, null, 2))
            }
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
                        <ClusterMarker point={point} supercluster={supercluster} />
                    ) : (
                        render({point})
                    )}
                </MemoizedMarker>
            ))}

            {onMapPressMarkerCoordinates ? 
            <Marker
                coordinate={onMapPressMarkerCoordinates}>
            </Marker> 
            : <></>}

            <Polyline coordinates={polylineCoords}/>

        </MapView>

        <View style={styles.buttons}>
            <IconButton
                icon={!showAudios ? "music-note-off-outline" : "music-note-outline"}
                size={40}
                onPress={() => setShowAudios(!showAudios)}
            ></IconButton>
            <IconButton
                icon={!showPOIs ? "map-marker-off-outline" : "map-marker-outline"}
                size={40}
                onPress={() => setShowPOIs(!showPOIs)}
            ></IconButton>
            <IconButton
                icon={"directions-fork"}
                size={40}
                onPress={handleDirectionsButtonPress}
            >

            </IconButton>
        </View>

        {showDirectionsMenu ? 
        <View style={{ position: 'absolute', top: 0, zIndex: 1, width: '100%' }}>
            <DirectionsSelector 
                onClose={handleDirectionsButtonPress}
                onMapPressEventCoords={directionsOnMapPressEvent}
                onRouteCompute={setPolylineCoords}
            />
        </View>
        :
        <></>}
    </>
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
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1000,
      },
    buttons: {
        position: "absolute",
        bottom: 0,
        right: 0,
    }
});
