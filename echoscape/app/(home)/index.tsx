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
} from "@charlespalmerbf/react-native-leaflet-js";

import { Button, Modal, Portal } from "react-native-paper";

import { createMapMarker } from "@/utils/markers/mapMarkers";
import { getCurrentPosition } from "@/utils/location/location";
import { useNetwork } from "@/utils/network/NetworkProvider";
import MarkerModal from "@/components/MarkerModals/MarkerModal";
import { getMarkerNumber, getMarkerType } from "@/utils/markers/markerId";

export default function Page() {
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );

    const [markers, setMarkers] = useState<MapMarker[]>([]);

    const addMapMarker = useCallback((lat: number, lng: number, id: string) => {
        setMarkers((prev) => [...prev, createMapMarker(lat, lng, id)]);
    }, []);

    const { dispatch, status, withAuthFetch } = useAuth();

    const [currentMarkerID, setCurrentMarkerID] = useState<string>("")
    const [currentMarkerNumber, setCurrentMarkerNumber] = useState<number | null>(null);

    const hideModal = () => {
        setCurrentMarkerNumber(null);
    };

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
                    onMessageReceived={(message) => {
                        if (message.event === "onMapMarkerClicked") {
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
                        21;
                    }}
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
