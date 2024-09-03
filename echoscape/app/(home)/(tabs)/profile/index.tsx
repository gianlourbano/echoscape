import { useAuth } from "@/utils/auth/AuthProvider";
import useSwr from "swr";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useEffect, useState } from "react";
import {
    RefreshControl,
    RefreshControlComponent,
    ScrollView,
    View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Button, Surface, Text, Avatar, IconButton, Icon } from "react-native-paper";
import { Image, SafeAreaView } from "moti";
import { Audio } from "@/components/Audio/Audio";
import { Link, router } from "expo-router";
import { UserData } from "@/utils/auth/types";
import * as ImagePicker from "expo-image-picker";
import { useFetch } from "@/hooks/useFetch";

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
        />
    );
};

const UploadedAudio = ({ audio }: { audio: any }) => {
    return (
        <View
            key={audio.id}
            className="p-4 bg-zinc-800 flex flex-row items-center rounded-md"
        >
            <View className="flex-1">
                <Link href={`/song/${audio.id}`}>
                    <Text variant="bodyLarge">Audio #{audio.id}</Text>
                </Link>
            </View>
            <View className="flex flex-row items-center justify-center">
                <Link href={`/?latitude=${audio.latitude}&longitude=${audio.longitude}`} asChild>
                    <IconButton icon="map-marker-radius"/>
                </Link>
                <IconButton icon={audio.hidden ? "closed-eye" : "eye"} onPress={() => {}} />
                <IconButton icon="delete" onPress={() => {}} />
            </View>
        </View>
    );
};

const ProfilePage = () => {
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

    const { user, dispatch } = useAuth();
    const { data, isLoading, error } = useFetch(`/audio/my`);

    useEffect(() => {
        loadRecordings();
    }, []);

    return (
        <SafeAreaView className="w-full bg-zinc-700 h-full">
            <View className="p-4 bg-zinc-700 flex flex-row items-center gap-4">
                <UserAvatar user={user} />
                <Link href="/debug" asChild>
                <Text
                    variant="headlineMedium"
                    className="flex-1"
                    >
                    {user?.username}
                </Text>
                    </Link>
                <Button onPress={() => dispatch("logout")}>Logout</Button>
            </View>
            <View className="border-solid border-2 border-zinc-800 my-4 mx-8" />
            <View className="p-4 flex justify-center gap-4">
                <Text variant="titleLarge">Uploaded Audios</Text>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    data.map((audio) => {
                        return <UploadedAudio key={audio.id} audio={audio} />;
                    })
                )}
            </View>
            <ScrollView>
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={async () => {
                        loadRecordings();
                    }}
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
        </SafeAreaView>
    );
};

export default ProfilePage;
