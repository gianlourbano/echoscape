import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

//import { LatLng, LeafletView, MapMarker } from 'react-native-leaflet-view';
import * as Location from "expo-location";

import { Button } from "react-native-paper";

import { usePlaySound, useRecordSound } from "@/app/hooks/useSound";
import ConditionalButton from "@/components/conditionalButton";
import { createMapMarker } from "@/utils/utils/mapMarkers";

import testSound1 from "../../../assets/3515__patchen__tone-1.wav";
import testSound2 from "../../../assets/130604__delta_omega_muon__dtmf_tone.wav";
import testSound3 from "../../../assets/18987__johnnypanic__bass-tone.wav";

import * as FileSystem from "expo-file-system";
import { ss_get } from "@/utils/secureStore/SStore";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useAuth } from "@/utils/auth/AuthProvider";

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

    /*const position1: LatLng = {
    lat: 37.78825,
    lng: -122.4324,
  }
  const mark: MapMarker = createMapMarker(position1)
  const mapMarkers = [mark]
  */

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

    const [recordings, setRecordings] = useState<string[]>([]);

    async function loadRecordings() {
        const dir = await getUserBaseURI();
        const recordings = await FileSystem.readDirectoryAsync(dir);
        console.log("recordings: ", recordings);
        setRecordings(recordings.map((recording) => dir + "/" + recording));
    }

    const {dispatch } = useAuth();

    useEffect(() => {
        loadRecordings();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.main}>
                <Text style={styles.title}>Hello World</Text>

                <Button mode="contained" onPress={testFunction}>
                    riproduci suono predefinito
                </Button>

                <ConditionalButton
                    Button1={
                        <Button onPress={stopRecordButton}>
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

                <Text style={styles.subtitle}>
                    This is the first page of your app.
                </Text>

                <Button onPress={async () => {
                    // const username = await getUserBaseURI();
                    // await FileSystem.makeDirectoryAsync(username, {intermediates: true});
                    // console.log("username: ", username);
                    
                    loadRecordings();
                
                }}>PRESS ME MF!</Button>

                <Button onPress={() => dispatch("logout")}>Logout</Button>

                <View>
                    {recordings.map((recording, index) => {
                        return (
                            <View key={index}>
                                <Text>{recording}</Text>
                                <Button
                                    onPress={() =>
                                        playSound({
                                            uri:
                                                recording,
                                        })
                                    }
                                >
                                    riproduci
                                </Button>
                                <Button
                                    onPress={() =>
                                        FileSystem.deleteAsync(recording)
                                    }
                                    className="text-red-500"
                                >
                                    elimina
                                </Button>
                            </View>
                        );
                    })}
                </View>
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
