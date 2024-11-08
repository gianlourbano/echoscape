import { useAuth } from "@/utils/auth/AuthProvider";
import useSwr from "swr";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useEffect, useState } from "react";
import {
    RefreshControl,
    RefreshControlComponent,
    ScrollView,
    View,
    useWindowDimensions,
} from "react-native";
import * as FileSystem from "expo-file-system";
import {
    Button,
    Surface,
    Text,
    Avatar,
    IconButton,
    Icon,
} from "react-native-paper";
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

const funnyTextsLmao = [
    {
        title: "So empty!",
        subtitle: "Upload some audios!",
    },
    {
        title: "Wow!",
        subtitle: "Such empty!",
    },
    {
        title: "No audios here!",
        subtitle: "Upload some!",
    },
    {
        title: "Is that music?!",
        subtitle: "Upload it!",
    },
];

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
        <SafeAreaView key={audio.id} className="flex flex-col bg-zinc-800 rounded-md p-4">
            <View className=" bg-zinc-800 flex flex-row items-center rounded-md">
                <View className="flex-1">
                    <Link href={`/song/${audio.id}`}>
                        <Text variant="bodyLarge">Audio #{audio.id}</Text>
                    </Link>
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
        </SafeAreaView>
    );
};

const BackendAudioView = () => {
    const { data, isLoading, error, mutate } = useFetch(`/audio/my`, {
        cache: false,
    });

    return (
        <ScrollView className="p-2">
            <RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />
            <View className="flex-1 p-2 flex flex-col gap-4">
                {data?.map((audio: BackendAudioItem, index: number) => {
                    return (
                        <UploadedAudio
                            key={audio.id + index}
                            audio={audio}
                            mutate={mutate}
                        />
                    );
                })}
            </View>
        </ScrollView>
    );
};

const LocalAudioView = () => {
    const [recordings, setRecordings] = useState<string[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    async function loadRecordings() {
        setRefreshing(true);

        const dir = await getUserBaseURI();
        const recordings = await FileSystem.readDirectoryAsync(dir);
        console.log("recordings: ", recordings);
        setRecordings(
            recordings.map((recording) => dir + "/" + recording).reverse()
        );
        setRefreshing(false);
    }

    useEffect(() => {
        loadRecordings();
    }, []);

    return (
        <View>
            <ScrollView>
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => loadRecordings()}
                />
                {recordings.length === 0 ? (
                    <View className="flex flex-col items-center">
                        {(() => {
                            const randomIndex = Math.floor(
                                Math.random() * funnyTextsLmao.length
                            );
                            return (
                                <>
                                    <Text variant="titleLarge">
                                        {funnyTextsLmao[randomIndex].title}
                                    </Text>
                                    <Text variant="titleLarge">
                                        {funnyTextsLmao[randomIndex].subtitle}
                                    </Text>
                                </>
                            );
                        })()}
                    </View>
                ) : (
                    <>
                        <View className="flex flex-col p-4 gap-4">
                            {recordings.map((recording, index) => {
                                return (
                                    <Audio
                                        key={index}
                                        index={index + 1}
                                        name={recording}
                                        refresh={() => loadRecordings()}
                                    />
                                );
                            })}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const renderScene = SceneMap({
    backend: BackendAudioView,
    local: LocalAudioView,
});

const ProfilePage = () => {
    const { user, dispatch, withAuthFetch } = useAuth();

    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: "backend", title: "Backend" },
        { key: "local", title: "Local" },
    ]);

    return (
        <SafeAreaView className="w-full bg-zinc-700 h-full">
            <View className="p-4 bg-zinc-700 flex flex-row items-center gap-4">
                <UserAvatar user={user} />
                <Link href="/debug" asChild>
                    <Text variant="headlineMedium" className="flex-1">
                        {user?.username}
                    </Text>
                </Link>
                <View>
                    <Button onPress={() => dispatch("logout")}>Logout</Button>
                    <Button
                        onPress={() => {
                            withAuthFetch(
                                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/auth/unsubscribe`,
                                {
                                    method: "DELETE",
                                }
                            ).then(() => dispatch("logout"));
                        }}
                    >
                        DEL ACC
                    </Button>
                </View>
            </View>
            <View className="border-solid border-2 border-zinc-800 my-4 mx-8" />

            <View className="p-4 flex justify-center gap-4">
                <Text variant="titleLarge">Uploaded Audios</Text>
            </View>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <View className="flex flex-row w-full justify-evenly">
                        {props.navigationState.routes.map((route, i) => (
                            <Button
                                key={`${route.key}-${i}`}
                                onPress={() => {
                                    setIndex(i);
                                }}
                            >
                                {route.title}
                            </Button>
                        ))}
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default ProfilePage;
