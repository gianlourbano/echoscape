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
import { useMap } from "react-leaflet";

import { Button, Modal, Portal } from "react-native-paper";

import { invalidateToken, invalidateUser } from "@/utils/utils";
import { createMapMarker } from "@/utils/utils/mapMarkers";
import { getCurrentPosition } from "@/utils/location/location";
import { GestureResponderEvent } from "react-native";

import MapView, { UrlTile } from "react-native-maps";

const Marker = () => {
    return (
        <div key="test2" className="">
            Helloooo
        </div>
    );
};

export default function Page() {
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );

    const [markers, setMarkers] = useState<MapMarker[]>([]);

    const addMapMarker = useCallback((lat: number, lng: number, id: string) => {
        setMarkers((prev) => [...prev, createMapMarker(lat, lng, id)]);
    }, []);

    const { dispatch, status, withAuthFetch } = useAuth();

    const [currentMarker, setCurrentMarker] = useState<number | null>(null);

    const hideModal = () => {
        setCurrentMarker(null);
    };

    useEffect(() => {
        getCurrentPosition().then((loc) => {
            withAuthFetch("http://130.136.2.83/audio/all")
                .then((data) => data.json())
                .then((data) => {
                    console.log(data);
                    data.forEach(
                        (audio: {
                            id: number;
                            latitude: number;
                            longitude: number;
                        }) =>
                            addMapMarker(
                                audio.latitude,
                                audio.longitude,
                                `marker-audio:${audio.id}`
                            )
                    );
                });

            if (loc) {
                setLocation(loc);
                addMapMarker(loc.coords.latitude, loc.coords.longitude, "marker-own:0");
            }
        });
    }, []);

    return (
        <>
            <Portal>
                <Modal
                    visible={currentMarker !== null}
                    onDismiss={hideModal}
                    contentContainerStyle={{
                        backgroundColor: "white",
                        padding: 20,
                        borderRadius: 10,
                        margin: 20,
                        alignItems: "center",
                    }}
                >
                    <Text>
                        Example Modal. Click outside this area to dismiss.
                    </Text>
                    <Text>Current marker: {currentMarker}</Text>
                </Modal>
            </Portal>
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
                            const type = message.payload.mapMarkerID
                                .split("marker-")[1]
                                .split(":")[0];
                                console.log(type);

                                switch(type) {
                                    case "audio":
                                        setCurrentMarker(Number(message.payload.mapMarkerID.split(":")[1]));
                                        break;
                                    case "own":
                                        setCurrentMarker(0);
                                        break;
                                    default:
                                        setCurrentMarker(null);
                                }
                        }
                        21.
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
