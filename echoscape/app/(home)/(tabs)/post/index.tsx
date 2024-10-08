import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { useNetInfo } from "@react-native-community/netinfo";

import { View as MotiView, AnimatePresence } from "moti";

import * as FileSystem from "expo-file-system";
import { getUserBaseURI, getUserTmpUri } from "@/utils/fs/fs";

import { usePlaySound, useRecordSound } from "@/hooks/useSound";

import { Audio, AudioProps } from "@/components/Audio/Audio";
import { useSQLiteContext } from "expo-sqlite";
import { useAudioDB, AudioData } from "@/utils/sql/sql";

import { sendOverpassRequest } from "@/utils/overpass/request";
import PageContainer from "@/components/PageContainer";

import { uploadAudio } from "@/utils/tasks/audioUpload";

export default function Page() {
    const [recordings, setRecordings] = useState<string[]>([]);

    const { startRecording, stopRecording } = useRecordSound();
    const { addAudioData, uploadAudioData, getAudioData, deleteAllAudioData } = useAudioDB();

    const [isRecording, setIsRecording] = useState(false); //used for conditionalButton

    const [recordedAudioUri, setRecordedAudioUri] = useState<
        string | null | undefined
    >();

   

    async function loadRecordings() {
        const dir = await getUserTmpUri();
        const recordings = await FileSystem.readDirectoryAsync(dir);
        console.log("recordings: ", recordings);
        setRecordings(
            recordings.map((recording) => dir + "/" + recording).reverse()
        );
    }

    const stopRecordingAndSaveTmp = async () => {
        const uri = await stopRecording();

        const dir = await getUserTmpUri();
        const filename = `recording-${Date.now()}.wav`;

        await FileSystem.moveAsync({
            from: uri,
            to: dir + "/" + filename,
        });

        // await addAudioData(filename).then(async () => {
        //     const r = await getAudioData();
        //     console.log(r);
        // });

        loadRecordings();
    };

    //RIMOSSO PER SPOSTARE L'UPLOAD IN UN ALTRO FILEconst netInfo = useNetInfo();
/*
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
    };*/

    useEffect(() => {
        loadRecordings();
    }, []);

    return (
        <PageContainer className="flex flex-1 flex-col">
            <View className="h-[30%]">
                <Button onPress={() => startRecording()}>Record</Button>
                <Button onPress={() => stopRecordingAndSaveTmp()}>Stop</Button>
                <Button onPress={() => deleteAllAudioData()}>
                    DELETE EVERYTHING
                </Button>
                <Button onPress={async () => console.log(await getAudioData())}>PRINT DATA</Button>
            </View>
            <ScrollView className=" scroll-pb-10 rounded-t-lg">
                <View className="flex flex-col gap-2 w-full rounded-t-lg pb-10">
                    <AnimatePresence>
                        {recordings.map((file, index) => (
                            <MotiView
                                key={file + index}
                                className="flex flex-col bg-slate-600 p-4 rounded-lg"
                                from={{
                                    opacity: 0,
                                    translateY: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    translateY: 0,
                                }}
                            >
                                <Audio
                                    index={index + 1}
                                    name={file}
                                    refresh={() => loadRecordings()}
                                />
                                <View className="flex flex-row w-full gap-2 justify-evenly">
                                    <Button onPress={() => {}}>Delete</Button>
                                    <Button onPress={() => uploadAudio(file, loadRecordings)}>
                                        Upload
                                    </Button>
                                </View>
                            </MotiView>
                        ))}
                    </AnimatePresence>
                </View>
            </ScrollView>
        </PageContainer>
    );

}

const styles = StyleSheet.create({
    
    container: {
        flex: 1,
        padding: 24,
        paddingBottom: 0,
        overflow: "scroll",
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