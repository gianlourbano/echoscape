import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "react-native";
import { Link } from "expo-router";

import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "@/utils/auth/AuthProvider";
import * as Location from "expo-location";
import { LeafletView } from "@charlespalmerbf/react-native-leaflet-js";
import { useMap } from "react-leaflet";

import { Button } from "react-native-paper";

import { invalidateToken, invalidateUser } from "@/utils/utils";
import { createMapMarker } from "@/utils/utils/mapMarkers";
import { getCurrentPosition } from "@/utils/location/location";

export default function Page() {
    const [isConnected, setIsConnected] = useState<boolean | null>(false);

    const [location, setLocation] = useState<Location.LocationObject | null>(null)

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);
            setIsConnected(state.isConnected);
        });
        (async () => {
            let position = await getCurrentPosition()
            setLocation(position)
            console.log("homePage useEffect getcurrentposition ", position?.coords.latitude, position?.coords.longitude)
        })()

        return () => {
            unsubscribe();
        };
    }, []);

    const {status: authStatus, dispatch} = useAuth();



    function testFunctionButton() {
        setLocation((prevLocation) => ({
            timestamp: prevLocation?.timestamp ?? 0, 
            coords: {
                latitude: ((prevLocation?.coords.latitude ?? 0) + 0.1) ?? 0, 
                longitude: ((prevLocation?.coords.longitude ?? 0) + 0.1) ?? 0,
                altitude: prevLocation?.coords.altitude ?? 0, 
                accuracy: prevLocation?.coords.accuracy ?? 0, 
                altitudeAccuracy: prevLocation?.coords.altitudeAccuracy ?? 0, 
                heading: prevLocation?.coords.heading ?? 0, 
                speed: prevLocation?.coords.speed ?? 0
            }
        }))
        console.log("location?.coords.latitude", location?.coords.latitude)
        console.log("location?.coords.longitude", location?.coords.longitude)
    }

    return (
        <View style={styles.container}>
            <View style={styles.main}>
                <Image
                    source={require("../../assets/image.png")}
                    className="self-center"
                />

                {/*<Text style={styles.title}>Map goes here</Text>*/}
                <View style={styles.container}>
                    <LeafletView 
                        mapCenterPosition={location ? {lat: location.coords.latitude, lng: location.coords.longitude} : {lat: 0, lng: 0} }
                        mapMarkers={[createMapMarker(location?.coords.latitude ?? 0, location?.coords.longitude ?? 0)]}
                        doDebug={false}
                    />
                </View>
                <Button onPress={testFunctionButton}>cambia posizione</Button> {/*giusto per provare se la mappa si sposta con l'aggiornarsi dello stato (sì si aggiorna)*/}
                <Text>location(usestate): {location?.coords.latitude + " " + location?.coords.longitude}</Text>

                <Text className="">
                    Connection status:{" "}
                    {isConnected ? "Connected!" : "Not connected :/"}
                </Text>
                <Text>{authStatus};</Text>
                <Link href="/second" style={styles.subtitle}>
                    Next
                </Link>

                <TokenTest />

                <Button onPress={async () => {
                    dispatch("logout");
                }}>Logout</Button> 

                <Button onPress={async () => {
                    //await invalidateUser();
                    await invalidateToken();
                }}>Invalidate things</Button>
            </View>
        </View>
    );
}

const TokenTest = () => {
    const { withAuthFetch } = useAuth();


    
    return (
        <View>
            <Button onPress={() => {
                withAuthFetch("http://130.136.2.83/audio/all", {}).then((res) => res?.json()).then((data) => console.log(data))
            }}>Test Token</Button>
        </View>
    )
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
