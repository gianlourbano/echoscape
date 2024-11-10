import { useAuth } from "@/utils/auth/AuthProvider";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useCallback, useEffect, useState } from "react";
import {
    RefreshControl,
    RefreshControlComponent,
    ScrollView,
    View,
    useWindowDimensions,
    Text,
    TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Button, Surface, Avatar, IconButton, Icon } from "react-native-paper";
import { Image, SafeAreaView } from "moti";
import { Audio } from "@/components/Audio/Audio";
import { Link, router, Tabs, useLocalSearchParams } from "expo-router";
import { UserData } from "@/utils/auth/types";
import * as ImagePicker from "expo-image-picker";
import { useFetch } from "@/hooks/useFetch";

import { TabView, SceneMap } from "react-native-tab-view";
import { Stats } from "@/components/Profile/Stats";
import { AudioPlayer } from "@/components/Audio/AudioPlayer";
import { useAudioDB } from "@/utils/sql/sql";
import PageContainer from "@/components/PageContainer";
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import * as FS from "expo-file-system";
import { useLevelInfo } from "@/utils/level/level";
import { useNetInfo } from "@react-native-community/netinfo";

interface BackendAudioItem {
    id: number;
    longitude: number;
    latitude: number;
    hidden: boolean;
}

const UserAvatar = ({ user }: { user: UserData }) => {
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            console.log(result.assets[0].uri);

            const baseDir = await getUserBaseURI();
            await FS.copyAsync({
                from: result.assets[0].uri,
                to: `${baseDir}/profile.jpg`,
            });
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        (async () => {
            const baseDir = await getUserBaseURI();
            const profileImage = await FileSystem.getInfoAsync(
                `${baseDir}/profile.jpg`
            );
            if (profileImage.exists) {
                setImage(`${baseDir}/profile.jpg`);
            } else {
                console.log("fucked up big time");
            }
        })();
    }, []);

    return (
        <Avatar.Image
            source={{ uri: image }}
            size={80}
            onTouchStart={() => pickImage()}
            theme={{ colors: { primary: "#16a34a" } }}
        />
    );
};

const UploadedAudio = ({
    audio,
    mutate,
}: {
    audio: BackendAudioItem;
    mutate: any;
}) => {
    const { withAuthFetch } = useAuth();

    const netInfo = useNetInfo();

    const [uri, setUri] = useState<string | null>(null);

    const { getAudioFromBackendID } = useAudioDB();

    useEffect(() => {
        getAudioFromBackendID(audio.id).then((audio) => {
            setUri(audio);
        });
    });

    return (
        <View
            key={audio.id}
            className="flex flex-col bg-zinc-800 rounded-md p-4"
        >
            <View className=" bg-zinc-800 flex flex-row items-center rounded-md">
                <View className="flex-1">
                    <Link href={`/song/${audio.id}`}>
                        <Text className="font-bold text-white text-lg">
                            Audio #{audio.id}
                        </Text>
                    </Link>
                    <Text className="text-gray-500">
                        {uri && `${extractDate(extractFileName(uri))[0]} | `}
                        {uri && extractDate(extractFileName(uri))[1]}
                    </Text>
                </View>
                <View className="flex flex-row items-center justify-center">
                    <Link
                        href={`/?latitude=${audio.latitude}&longitude=${audio.longitude}`}
                        asChild
                    >
                        <IconButton icon="map-marker-radius" />
                    </Link>
                    <IconButton
                        icon={audio.hidden ? "eye-off" : "eye"}
                        disabled={!netInfo.isConnected}
                        onPress={() => {
                            withAuthFetch(
                                `${
                                    process.env.EXPO_PUBLIC_BACKEND_BASE_URL
                                }/audio/my/${audio.id}/${
                                    audio.hidden ? "show" : "hide"
                                }`
                            ).then(() => mutate());
                        }}
                    />
                    <IconButton
                        icon="delete"
                        disabled={!netInfo.isConnected}
                        onPress={() => {
                            withAuthFetch(
                                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${audio.id}`,
                                {
                                    method: "DELETE",
                                }
                            )
                                .then((res) => res.json())
                                .then((res) => {
                                    console.log(res);
                                    mutate();
                                });
                        }}
                    />
                </View>
            </View>
            {uri && <AudioPlayer uri={uri} />}
        </View>
    );
};

const BackendAudioView = () => {
    const { getAudioData } = useAudioDB();

    const netInfo = useNetInfo();

    const { data, isLoading, error, mutate } = useFetch(`/audio/my`, {
        cache: false,
    });

    const [offlineData, setOfflineData] = useState([]);

    // useEffect(() => {
    //     (async () => {
    //         if (!netInfo.isConnected) {
    //             const data = await getAudioData();
    //             console.log(data);

    //             setOfflineData(data.map(a => {
    //                 id: a.backend_id,

    //             }))
                
    //         }
    //     })();
    // }, [netInfo]);

    return (
        <ScrollView className="mt-2">
            <RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />

            <SafeAreaView className="flex flex-col gap-4">
                {!netInfo.isConnected &&
                    offlineData.map(
                        (audio: BackendAudioItem, index: number) => {
                            return (
                                <UploadedAudio
                                    key={audio.id + index}
                                    audio={audio}
                                    mutate={mutate}
                                />
                            );
                        }
                    )}
                {data &&
                    data?.map((audio: BackendAudioItem, index: number) => {
                        return (
                            <UploadedAudio
                                key={audio.id + index}
                                audio={audio}
                                mutate={mutate}
                            />
                        );
                    })}
            </SafeAreaView>
            <View className="h-32" />
        </ScrollView>
    );
};

export const extractFileName = (path: string) => {
    return path?.split("/").pop().split(".").slice(0, -1).join(".");
};

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const extractDate = (filename: string) => {
    const d = new Date(Number(filename.split("-")[1]));
    return [
        `${d.getDate()} ${months[d.getUTCMonth()]} ${d.getFullYear()}`,
        d.toISOString().split("T")[1].split(".")[0],
    ];
};

const ProfilePage = () => {
    const { newBadge } = useLocalSearchParams();

    console.log(newBadge);

    const { user } = useAuth();

    return (
        <PageContainer className="flex flex-col gap-4 p-4" safe>
            <View className="bg-zinc-800 rounded-md p-4 flex flex-row items-center gap-4">
                <UserAvatar user={user} />
                <Text className="text-white text-2xl font-bold flex-1">
                    @{user?.username}
                </Text>
                <View className="flex flex-col items-center justify-center">
                    <Link href="/settings" asChild>
                        <IconButton icon="cog" size={32} />
                    </Link>
                </View>
            </View>
            <LevelInfo newBadge={newBadge} />
            <Animated.View layout={LinearTransition} className="flex-1">
                <Text className="text-2xl text-green-600 font-bold">
                    Uploaded Audios
                </Text>
                <BackendAudioView />
            </Animated.View>
        </PageContainer>
    );
};

const LevelInfo = ({ newBadge }) => {
    const [isExpanded, setIsExpanded] = useState(newBadge === "1");

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const { levelInfo, update } = useLevelInfo();

    useEffect(() => {
        if (newBadge === "1") {
            update();
        }
    }, []);

    return (
        <TouchableOpacity
            onPress={toggleExpand}
            activeOpacity={1}
            className="bg-zinc-800"
            style={{ backgroundColor: "27272a" }}
        >
            <Animated.View
                layout={LinearTransition}
                className="bg-zinc-800 p-4 rounded-md"
            >
                <View className="flex flex-row gap-4 items-center">
                    <Text className="text-white font-bold text-2xl">
                        Level {levelInfo?.level}
                    </Text>
                    <View className="bg-zinc-700 flex-1 rounded-md h-3 w-full">
                        <Animated.View
                            layout={LinearTransition}
                            className="bg-green-600 h-full rounded-md"
                            style={{
                                width: `${
                                    (levelInfo?.exp / levelInfo?.nextLevel) *
                                    100
                                }%`,
                            }}
                        />
                    </View>
                </View>

                {isExpanded && (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Text className="text-white font-bold text-xl">
                            Experience: {levelInfo?.exp}/{levelInfo?.nextLevel}
                        </Text>
                        <Text className="text-white font-bold text-xl">
                            Something
                        </Text>
                        <View className="bg-zinc-700 rounded-md p-2 mt-2">
                            <Text className="text-green-600 font-bold text-xl mb-2">
                                Badges
                            </Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                {levelInfo?.badges.map((badge: string) => (
                                    <IconButton icon={badge} key={badge} />
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default ProfilePage;
