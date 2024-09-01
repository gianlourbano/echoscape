import { useAuth } from "@/utils/auth/AuthProvider";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useEffect, useState } from "react";
import { RefreshControl, RefreshControlComponent, ScrollView, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { Button, Surface, Text, Avatar } from "react-native-paper";
import { Image, SafeAreaView } from "moti";
import { Audio } from "@/components/Audio/Audio";
import { Link, router } from "expo-router";
import { UserData } from "@/utils/auth/types";
import * as ImagePicker from "expo-image-picker";

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
            source={{ uri: user.url }}
            size={80}
            onTouchStart={() => pickImage()}
        />
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

    useEffect(() => {
        loadRecordings();
    }, []);

    return (
        <SafeAreaView className="w-full bg-zinc-700 h-full">
            <View className="p-4 bg-zinc-700 flex flex-row items-center gap-4">
                <UserAvatar user={user} />
                <Text
                    variant="headlineMedium"
                    className="flex-1"
                    onPress={() => router.navigate("/debug")}
                >
                    {user?.username}
                </Text>
                <Button onPress={() => dispatch("logout")}>Logout</Button>
            </View>
            <View className="border-solid border-2 border-zinc-800 my-4 mx-8"/>
            <ScrollView>
                <RefreshControl refreshing={refreshing} onRefresh={async () => {loadRecordings()}}  />

                {recordings.length === 0 ? (
                    <View className="flex flex-col items-center">
                        <Text variant="titleLarge">So empty!</Text>
                        <Text variant="titleLarge"> Upload some audios!</Text>
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
