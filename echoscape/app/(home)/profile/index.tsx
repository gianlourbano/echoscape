import { useAuth } from "@/utils/auth/AuthProvider";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { Button, IconButton } from "react-native-paper";
import { usePlaySound } from "@/app/hooks/useSound";
import { AVPlaybackStatus } from "expo-av";

import { View as MotiView } from "moti";
import { invalidateToken, invalidateUser } from "@/utils/utils";

import { Audio, AudioProps } from "@/components/Audio/Audio";



const ProfilePage = () => {
    const [recordings, setRecordings] = useState<string[]>([]);

    async function loadRecordings() {
        const dir = await getUserBaseURI();
        const recordings = await FileSystem.readDirectoryAsync(dir);
        console.log("recordings: ", recordings);
        setRecordings(
            recordings.map((recording) => dir + "/" + recording).reverse()
        );
    }

    const { dispatch } = useAuth();

    useEffect(() => {
        loadRecordings();
    }, []);

    return (
        <View className="w-full">
            <Button onPress={() => dispatch("logout")}>Logout</Button>

            <Button
                onPress={async () => {
                    loadRecordings();
                }}
            >
                Refresh
            </Button>

            <Button onPress={() => {
                invalidateToken();
                invalidateUser();
            }}>
                Invalidate everything
            </Button>

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
        </View>
    );
};



export default ProfilePage;
