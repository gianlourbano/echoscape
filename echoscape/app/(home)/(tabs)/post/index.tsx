import PageContainer from "@/components/PageContainer";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { IconButton, Button } from "react-native-paper";
import { getUserTmpUri } from "@/utils/fs/fs";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import { Audio as AudioComponent } from "@/components/Audio/Audio";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAudioDB } from "@/utils/sql/sql";

type AudioItem = {
    id: string;
    uri: string;
    status: "pending" | "uploading" | "completed" | "failed";
};

export type AudioPageProps = {
    lat?: string;
    lng?: string;
};

export default function Page({}) {
    const { lat, lng } = useLocalSearchParams<AudioPageProps>();

    if (lat && lng) {
        //...
    } // /post?lat=123&lng=456

    const netInfo = useNetInfo();

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioItems, setAudioItems] = useState<string[]>([]);

    async function loadRecordings() {
        const dir = await getUserTmpUri();
        const recordings = await FileSystem.readDirectoryAsync(dir);
        console.log("recordings: ", recordings);
        setAudioItems(
            recordings.map((recording) => dir + "/" + recording).reverse()
        );
    }

    useEffect(() => {
        loadRecordings();
    }, []);

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }

    const { addAudioData, uploadAudioData, getAudioData, deleteAllAudioData } = useAudioDB();


    async function stopRecording() {
        if (!recording) return;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);

        if (uri) {
            const newItem: AudioItem = {
                id: Date.now().toString(),
                uri,
                status: "pending",
            };

            const dir = await getUserTmpUri();
            const filename = `recording-${Date.now()}.wav`;
            const to = `${dir}/${filename}`;

            await FileSystem.moveAsync({
                from: uri,
                to: to,
            });

            setAudioItems([...audioItems, to]);
        }
    }

    const uploadAudio = async (uri: string) => {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
            console.log("[AUDIO UP] Audio can be uploaded!");

            // fetch... 

            await addAudioData(uri).then(async () => {
                const r = await getAudioData();
                console.log(r);
            });

            const backendData = {}
        
            await uploadAudioData(uri, JSON.stringify(backendData)).then(async () => {
                const r = await getAudioData();
                console.log(r);
            });

            await FileSystem.moveAsync({
                from: uri,
                to: uri.replace("/tmp", ""),
            });

            console.log("[AUDIO UP] Audio uploaded!");

            loadRecordings();

        } else {
            console.log(
                "[AUDIO UP] No internet connection. Scheduled for later."
            );

            await addAudioData(uri).then(async () => {
                const r = await getAudioData();
                console.log(r);
            });
        }
    };

    return (
        <PageContainer className="flex-1 bg-zinc-700">
            <View>
                <Text className="text-2xl font-bold text-center text-white">
                    Record audio
                </Text>
            </View>
            <View>
                <Text className="text-lg text-center text-white">
                    Record audio and upload it!
                </Text>
                <View className="flex-row items-center justify-center">
                    <IconButton
                        icon="microphone"
                        onPress={recording ? stopRecording : startRecording}
                    />
                    <Text className="text-center mt-2 text-gray-600">
                        {recording
                            ? "Tap to stop recording"
                            : "Tap to start recording"}
                    </Text>
                </View>
                <View className="flex flex-col gap-4">
                    {audioItems.length > 0 &&
                        audioItems.map((item, index) => {
                            return (
                                <View key={item}>
                                    <AudioComponent
                                        index={index}
                                        name={item}
                                        refresh={loadRecordings}
                                    />
                                    
                                    <View className="flex flex-row w-full gap-2 justify-evenly">
                                        <Button onPress={() => {}}>
                                            Delete
                                        </Button>
                                        <Button
                                            onPress={() =>
                                                uploadAudio(
                                                    item
                                                )
                                            }
                                        >
                                            Upload
                                        </Button>
                                    </View>
                                </View>
                            );
                        })}
                </View>
            </View>
        </PageContainer>
    );
}
