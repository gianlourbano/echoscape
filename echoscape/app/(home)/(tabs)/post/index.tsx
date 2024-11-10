import PageContainer from "@/components/PageContainer";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Button,
} from "react-native";
import { useState, useEffect } from "react";
import { getUserTmpUri } from "@/utils/fs/fs";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { extractDate, extractFileName } from "@/components/Audio/Audio";
import { useNetInfo } from "@react-native-community/netinfo";
import { deleteAudioData, useAudioDB } from "@/utils/sql/sql";
import { useAuth } from "@/utils/auth/AuthProvider";
import { useLocation } from "@/utils/location/location";
import { Recorder } from "@/components/Audio/Recorder";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
} from "react-native-reanimated";
import { AudioPlayer } from "@/components/Audio/AudioPlayer";
import { IconButton } from "react-native-paper";
import { updateLevelInfo } from "@/utils/level/level";

type AudioItem = {
    id: string;
    uri: string;
    status: "pending" | "uploading" | "completed" | "failed";
};

export type AudioPageProps = {
    lat?: string;
    lng?: string;
    name?: string;
};

const ToBeUploadedAudio = ({
    uri,
    index,
    refresh,
}: {
    uri: string;
    index: number;
    refresh: () => void;
}) => {
    return (
        <Animated.View className="bg-zinc-800 rounded-md p-2">
            <View className="flex flex-row items-center">
                <View className="flex-1">
                    <Text className="text-white font-bold text-xl">
                        Recording #{index}
                    </Text>
                    <Text className="text-white">
                        {extractDate(extractFileName(uri))[0] +
                            "|" +
                            extractDate(extractFileName(uri))[1]}
                    </Text>
                </View>
                <IconButton
                    className=" "
                    icon="delete"
                    iconColor="white"
                    onPress={async () => {
                        FileSystem.deleteAsync(uri).then(() => refresh());
                        await deleteAudioData(uri);
                    }}
                />
            </View>
            <AudioPlayer uri={uri} />
        </Animated.View>
    );
};

export default function Page({}) {
    const { lat, lng, name } = useLocalSearchParams<AudioPageProps>();

    const loc = useLocation();

    const netInfo = useNetInfo();

    const { withAuthFetch } = useAuth();

    const [audioItems, setAudioItems] = useState<string[]>([]);

    const { addAudioData, uploadAudioData } = useAudioDB();

    async function loadRecordings() {
        const dir = await getUserTmpUri();
        const recordings = await FileSystem.readDirectoryAsync(dir);

        // filter out non-audio files
        const audioRegex = /.*\.m4a/;
        const audioFiles = recordings.filter((recording) =>
            audioRegex.test(recording)
        );
        

        const sorted = audioFiles.sort((a, b) => {
            return (
                new Date(b.split("-")[1]).getTime() -
                new Date(a.split("-")[1]).getTime()
            );
        });
        setAudioItems(sorted.map((recording) => dir + "/" + recording));
    }

    useEffect(() => {
        loadRecordings();
    }, []);

    const uploadAudio = async (uri: string) => {
        await addAudioData(uri);

        if (netInfo.isConnected && netInfo.isInternetReachable) {
            const form = new FormData();
            // @ts-ignore
            form.append("file", {
                uri: uri,
                name: "audio.m4a",
                type: "audio/*",
            });

            const audioCoords = {
                lat: lat && lng ? lat : loc.coords.latitude,
                lng: lat && lng ? lng : loc.coords.longitude,
            };

            const response = await withAuthFetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/upload?longitude=${audioCoords.lng}&latitude=${audioCoords.lat}`,
                {
                    method: "POST",
                    body: form,
                }
            );

            if (!response.ok) {
                console.error("Error uploading audio:", await response.json());
                return;
            }

            const data = await response.json();
            const allaudios = await (
                await withAuthFetch(
                    `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/my`
                )
            ).json();

            // search for the audio we just uploaded

            console.log(allaudios);
            console.log(data);

            // refetch every fucking single audio

            const audio_data_all = await Promise.all(
                (
                    await Promise.all(
                        allaudios.map((audio) => {
                            return withAuthFetch(
                                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${audio.id}`
                            );
                        })
                    )
                ).map((res) => res.json())
            );

            // now try and match loudness, bpm and danceability

            const final_backend_id = audio_data_all.find((audio) => {
                return (
                    audio.tags.bpm === data.bpm &&
                    audio.tags.loudness === data.loudness &&
                    audio.tags.danceability === data.danceability
                );
            })?.id;

            console.log(final_backend_id);

            await uploadAudioData(uri, JSON.stringify(data), final_backend_id);

            await FileSystem.moveAsync({
                from: uri,
                to: uri.replace("/tmp", ""),
            });

            console.log("[AUDIO UP] Audio uploaded!");

            await updateLevelInfo(20);

            loadRecordings();
        } else {
            console.log(
                "[AUDIO UP] No internet connection. Scheduled for later."
            );
        }
    };

    const [isRecording, setIsRecording] = useState(false);

    return (
        <PageContainer className="flex flex-col bg-zinc-700 h-full p-4" safe>
            <View className="flex-1 flex flex-col gap-4">
                <View className="flex flex-row items-center">
                    <Text className="text-2xl font-bold text-green-600 flex-1 p-2">
                        Pending Audios
                    </Text>

                    {(name) ? (
                        <Animated.View className="bg-green-600 rounded-md p-2" exiting={FadeOut}>
                            <TouchableOpacity onPress={() => {router.replace("/post")}}>
                                <Text className="text-lg text-white font-bold">
                                    Associate to {name}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ): null}
                </View>
                <ScrollView>
                    <RefreshControl
                        onRefresh={() => loadRecordings()}
                        refreshing={false}
                    />
                    <View className="mt-4 flex flex-col gap-4">
                        {audioItems.length > 0 &&
                            audioItems.map((item, index) => {
                                return (
                                    <Animated.View
                                        className="bg-zinc-800 rounded-md"
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        key={item}
                                    >
                                        <ToBeUploadedAudio
                                            uri={item}
                                            index={index + 1}
                                            refresh={() => loadRecordings()}
                                        />
                                        <TouchableOpacity
                                            onPress={() => uploadAudio(item)}
                                            className="px-2 pb-2"
                                        >
                                            <View className="bg-green-600 p-2 rounded-md">
                                                <Text className="text-white text-center">
                                                    Upload
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                    </View>
                </ScrollView>
            </View>
            <View className="h-[27%]">
                <GestureHandlerRootView>
                    <Recorder
                        isRecording={isRecording}
                        onPressStart={() => setIsRecording(true)}
                        onPressStop={() => {
                            setIsRecording(false);
                        }}
                        onNewAudioReady={() => loadRecordings()}
                    />
                </GestureHandlerRootView>
            </View>
        </PageContainer>
    );
}
