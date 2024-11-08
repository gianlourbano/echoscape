import { useAuth } from "@/utils/auth/AuthProvider";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useEffect, useState } from "react";
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
import { Link, router, Tabs } from "expo-router";
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
            setImage(result.assets[0].uri);
            user.url = result.assets[0].uri;
        }
    };

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
                        {uri && extractDate(extractFileName(uri))[0]} |{" "}
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
    const { data, isLoading, error, mutate } = useFetch(`/audio/my`, {
        cache: false,
    });

    return (
        <ScrollView className="mt-2">
            <RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />

            <SafeAreaView className="flex flex-col gap-4">
                {data?.map((audio: BackendAudioItem, index: number) => {
                    return (
                        <UploadedAudio
                            key={audio.id + index}
                            audio={audio}
                            mutate={mutate}
                        />
                    );
                })}
            </SafeAreaView>
            <View className="h-32"/>
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
    const { user } = useAuth();

    return (
        <PageContainer className="flex flex-col gap-4 p-4" safe>
            <View className="bg-zinc-800 rounded-md p-4 flex flex-row items-center gap-4">
                <UserAvatar user={user} />
                <Text className="text-white text-2xl font-bold">
                    @{user?.username}
                </Text>
            </View>
            <LevelInfo />
            <Animated.View layout={LinearTransition} className="flex-1">
                <Text className="text-2xl text-green-600 font-bold">
                    Uploaded Audios
                </Text>
                <BackendAudioView />
            </Animated.View>
        </PageContainer>
    );
};

const LevelInfo = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

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
                        Level 5
                    </Text>
                    <View className="bg-zinc-700 flex-1 rounded-md h-3 w-full">
                        <View className="bg-green-600 w-[35%] h-full rounded-md" />
                    </View>
                </View>

                {isExpanded && (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Text className="text-white font-bold text-xl">
                            Experience: 700/2000
                        </Text>
                        <Text className="text-white font-bold text-xl">
                            Level up in 24 uploads!
                        </Text>
                        <View className="bg-zinc-700 rounded-md p-2 mt-2">
                            <Text className="text-green-600 font-bold text-xl mb-2">
                                Badges
                            </Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                <Icon source="matrix" color="white" size={35} />
                                <Icon source="debian" color="white" size={35} />
                                <Icon
                                    source="hammer-sickle"
                                    color="white"
                                    size={35}
                                />
                                <Icon
                                    source="radioactive"
                                    color="white"
                                    size={35}
                                />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default ProfilePage;
