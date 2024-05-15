import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "react-native";
import { Link } from "expo-router";

import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "@/utils/auth/AuthProvider";
import * as Location from "expo-location";
import {
    LeafletView,
    MapMarker,
    WebviewLeafletMessage,
    WebViewLeafletEvents as LeafletEvents
} from "@charlespalmerbf/react-native-leaflet-js";

import { Button, Modal, Portal } from "react-native-paper";

import { createMapMarker } from "@/utils/markers/mapMarkers";
import { getCurrentPosition } from "@/utils/location/location";
import { useNetwork } from "@/utils/network/NetworkProvider";
import MarkerModal from "@/components/MarkerModals/MarkerModal";
import { getMarkerNumber, getMarkerType } from "@/utils/markers/markerId";
import { fetchAudiosInBounds, filterAllAudios } from "@/utils/markers/audioAll";
import { cachedFetch, inCache } from "@/utils/cache/cache";

export default function Page() {
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );

    const [markers, setMarkers] = useState<MapMarker[]>([]);

    const addMapMarker = useCallback((lat: number, lng: number, id: string) => {
        setMarkers((prev) => [...prev, createMapMarker(lat, lng, id)]);
    }, []);

    const { dispatch, status, withAuthFetch } = useAuth();

    //used to display correct pop up when user presses on a marker on the map
    const [currentMarkerID, setCurrentMarkerID] = useState<string>("")
    const [currentMarkerNumber, setCurrentMarkerNumber] = useState<number | null>(null);

    //leaflet map related utility states 
    const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(0)
    const [currentBounds, setCurrentBounds] = useState({})

    //ids, lat and lng of all audios
    const [audioAllArray, setAudioAllArray] = useState([])

    //all audios - audios out of map borders - audios which data are already in cache
    const [audiosToFetch, setAudiosToFetch] = useState<string[]>([])

    const hideModal = () => {
        setCurrentMarkerNumber(null);
    };


    async function composeAudiosToFetchArray(
        maxLat: number,
        minLat: number,
        maxLng: number,
        minLng: number
    ) {
        if (audioAllArray.length !== 0) {
            const visibleAudios = filterAllAudios(audioAllArray, maxLat, minLat, maxLng, minLng)
            const notCachedAudios = await Promise.all(
                visibleAudios.map(item => inCache(`http://130.136.2.83/audio/${item.id}`))
            )
            setAudiosToFetch(
                audioAllArray.filter((item, index) => !notCachedAudios[index])
            )
        }
    }



    async function handleMapEvents(message: WebviewLeafletMessage) {
        if (message.event === LeafletEvents.ON_MAP_MARKER_CLICKED) {
            console.log(message.payload.mapMarkerID);
            const type = getMarkerType(message.payload.mapMarkerID)
            console.log(type);

            setCurrentMarkerID(message.payload.mapMarkerID)

            switch (type) {
                case "audio":
                    setCurrentMarkerNumber(
                        getMarkerNumber(message.payload.mapMarkerID)
                    );
                    break;
                case "own":
                    setCurrentMarkerNumber(0);
                    break;
                default:
                    setCurrentMarkerNumber(null);
            }
        }

        else if (message.event === LeafletEvents.ON_ZOOM_END) {
            //console.log("onZoomEnd zoom: ", message.payload.zoom)
            //console.log("onZoomEnd bounds: ", message.payload.bounds)

            setCurrentZoomLevel(message.payload.zoom)
            setCurrentBounds(message.payload.bounds)

            if (message.payload.zoom === 16) {
                const maxLat = Math.max(message.payload.bounds._northEast.lat, message.payload.bounds._southWest.lat)
                const minLat = Math.min(message.payload.bounds._northEast.lat, message.payload.bounds._southWest.lat)
                const maxLng = Math.max(message.payload.bounds._northEast.lng, message.payload.bounds._southWest.lng)
                const minLng = Math.min(message.payload.bounds._northEast.lng, message.payload.bounds._southWest.lng)
                
                //console.log("l'errore 500 qua sotto è perchè non so come si prende il token dell'utente. basta modificare qua sotto")
                //const audios = await fetchAudiosInBounds(maxLat, minLat, maxLng, minLng, "token?")

                composeAudiosToFetchArray(maxLat, minLat, maxLng, minLng)
                
            }
        }

        else if (message.event === LeafletEvents.ON_MOVE_END) {
            
            setCurrentZoomLevel(message.payload.zoom)
            setCurrentBounds(message.payload.bounds)

            if (message.payload.zoom === 16) {
                const maxLat = Math.max(message.payload.bounds._northEast.lat, message.payload.bounds._southWest.lat)
                const minLat = Math.min(message.payload.bounds._northEast.lat, message.payload.bounds._southWest.lat)
                const maxLng = Math.max(message.payload.bounds._northEast.lng, message.payload.bounds._southWest.lng)
                const minLng = Math.min(message.payload.bounds._northEast.lng, message.payload.bounds._southWest.lng)

                composeAudiosToFetchArray(maxLat, minLat, maxLng, minLng)
            }
        }
    }
    



    useEffect(() => {
        getCurrentPosition().then((loc) => {
            // withAuthFetch("http://130.136.2.83/audio/all")
            //     .then((data) => data.json())
            //     .then((data) => {
            //         console.log(data);
            //         data.forEach(
            //             (audio: {
            //                 id: number;
            //                 latitude: number;
            //                 longitude: number;
            //             }) =>
            //                 addMapMarker(
            //                     audio.latitude,
            //                     audio.longitude,
            //                     `marker-audio:${audio.id}`
            //                 )
            //         );
            //     });

            if (loc) {
                setLocation(loc);
                addMapMarker(
                    loc.coords.latitude,
                    loc.coords.longitude,
                    "marker-own:0"
                );
            }
        });


    }, []);



    /*
        requests all audio ids on map loading
        --
        TODO questo può essere fatto una volta quando l'applicazione viene aperta invece che ad ogni caricamento della mappa
            però in quel caso dovremmo implementare un bottone "aggiorna mappa", 
            in caso venissero caricati audio proprio dopo che l'utente apre l'app
        --
    */
        useEffect(() => {
            (async () => {
                const response = await withAuthFetch(`http://130.136.2.83/audio/all`);
                const data = await response.json();
                setAudioAllArray(data);
            })()
        }, [])



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
        let index = 0
        console.log("useeffect richiesta canzoni, index: ", index)
        const intervalId = setInterval(() => {
            if (audiosToFetch.length !== 0 && index < audiosToFetch.length) {
                withAuthFetch(
                    `http://130.136.2.83/audio/${audiosToFetch[index]}`,
                    undefined,
                    cachedFetch
                )
                index++;

                console.log("useeffect richiesta canzoni, entrato in if")
            } else {
                console.log("useeffect richiesta canzoni, entrato in else")
                clearInterval(intervalId)
            }
        }, 1000)
    
        return () => {
            console.log("useeffect richiesta canzoni, entrato in return")
            clearInterval(intervalId); 
        }
    }, [currentZoomLevel, currentBounds])

    return (
        <>
            <MarkerModal 
                visible={currentMarkerNumber != null}
                currentMarker={currentMarkerID}
                setCurrentMarker={setCurrentMarkerNumber} 
            />
            <View style={styles.container}>
                <LeafletView
                    mapCenterPosition={
                        location
                            ? {
                                  lat: location.coords.latitude,
                                  lng: location.coords.longitude,
                              }
                            : { lat: 0, lng: 0 }
                    }
                    mapMarkers={[...markers]}
                    doDebug={false}
                    onMessageReceived={handleMapEvents}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 24,
    },
    main: {
        flex: 1,
        justifyContent: "center",
        maxWidth: 960,
        marginHorizontal: "auto",
    },
    title: {
        fontSize: 64,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 36,
        color: "#38434D",
    },
});
