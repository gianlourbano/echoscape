import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

//import { LatLng, LeafletView, MapMarker } from 'react-native-leaflet-view';
import * as Location from "expo-location";

import { Button } from "react-native-paper";

import { usePlaySound, useRecordSound } from "@/app/hooks/useSound";
import ConditionalButton from "@/components/conditionalButton";

import testSound1 from "../../../assets/3515__patchen__tone-1.wav";
import testSound2 from "../../../assets/130604__delta_omega_muon__dtmf_tone.wav";
import testSound3 from "../../../assets/18987__johnnypanic__bass-tone.wav";

import * as FileSystem from "expo-file-system";
import { ss_get } from "@/utils/secureStore/SStore";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useAuth } from "@/utils/auth/AuthProvider";

import { Image } from "expo-image";

export default function Page() {
    const playSound = usePlaySound();
    const { startRecording, stopRecording } = useRecordSound();

    const [isRecording, setIsRecording] = useState(false); //used for conditionalButton

    const [recordedAudioUri, setRecordedAudioUri] = useState<
        string | null | undefined
    >();

    async function testFunction() {
        playSound(testSound2);
    }

    async function startRecordButton() {
        startRecording();
    }

    async function stopRecordButton() {
        const uri = await stopRecording();
        console.log("recorded sound URI: ", uri);

        setRecordedAudioUri(uri);
    }

    const [testText, setTestText] = useState("valore iniziale");
    const [testLocation, setTestLocation] = useState<Location.LocationObject>();

    async function positionButton() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setTestText("Permission to access location was denied");
            return;
        } else {
            setTestText("posizione accettata!");
            let location = await Location.getCurrentPositionAsync({});
            setTestLocation(location);
            setTestText(
                (prevText) =>
                    prevText +
                    " " +
                    location.coords.latitude +
                    " " +
                    location.coords.longitude +
                    " " +
                    location.coords.accuracy
            );
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.main}>
                <Image
                    source="https://picsum.photos/seed/696/3000/2000"
                    className="flex-1 w-full h-96"
                    contentFit="cover"
                    transition={1000}
                    placeholder={{
                        blurhash:
                            "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[",
                    }}
                />

                <Text style={styles.title}>Hello World</Text>

                <Button mode="contained" onPress={testFunction}>
                    riproduci suono predefinito
                </Button>

                <ConditionalButton
                    Button1={
                        <Button
                            onPress={() => {
                                stopRecordButton();
                            }}
                        >
                            finisci registrazione
                        </Button>
                    }
                    Button2={
                        <Button onPress={startRecordButton}>
                            inizia a registrare
                        </Button>
                    }
                    showButton1={isRecording}
                    setShowButton1={setIsRecording}
                />

                <Button
                    mode="contained"
                    disabled={!recordedAudioUri}
                    onPress={() => {
                        playSound({ uri: recordedAudioUri });
                    }}
                >
                    riproduci suono
                </Button>
            </View>
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
