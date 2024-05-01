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

import { Button } from "react-native-paper";

import { invalidateToken, invalidateUser } from "@/utils/utils";
import { createMapMarker } from "@/utils/utils/mapMarkers";
import { getCurrentPosition } from "@/utils/location/location";
import { GestureResponderEvent } from "react-native";

import MapView, { UrlTile } from "react-native-maps";

const Marker = () => {
    return <div key="test2" className="" >Helloooo</div>;
};

export default function Page() {
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );

    const [markers, setMarkers] = useState<MapMarker[]>([]);

    const addMapMarker = useCallback(
        (lat: number, lng: number, icon?: number) => {
            setMarkers((prev) => [...prev, createMapMarker(lat, lng, icon)]);
        },
        []
    );typeof fetch

    const { dispatch, status, withAuthFetch} = useAuth();
    

    useEffect(() => {
        getCurrentPosition().then((loc) => {

            withAuthFetch("http://130.136.2.83/audio/all").then((data) => 
                data.json()
            ).then((data) => {
                console.log(data);
                data.forEach((audio: { id: number, latitude: number, longitude: number }) => addMapMarker(audio.latitude, audio.longitude));
            })

            if (loc) {
                setLocation(loc);
                addMapMarker(loc.coords.latitude, loc.coords.longitude);
            }
        });
    }, []);

    return (
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
                
            />
        </View>
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
