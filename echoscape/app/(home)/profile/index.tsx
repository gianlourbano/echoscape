import { useAuth } from "@/utils/auth/AuthProvider";
import { getUserBaseURI } from "@/utils/fs/fs";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { Button, IconButton } from "react-native-paper";
import { usePlaySound } from "@/app/hooks/useSound";
import { AVPlaybackStatus } from "expo-av";

import { View as MotiView } from "moti";

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

const ProfilePage = () => {
    const playSound = usePlaySound();
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
                PRESS ME MF!
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

interface AudioProps {
    index: number;
    name: string;
    refresh?: () => void;
}

const extractFileName = (path: string) => {
    return path.split("/").pop().split(".").slice(0, -1).join(".");
};

const extractDate = (filename: string) => {
    const d = new Date(Number(filename.split("-")[1]));
    return [
        `${d.getDate()} ${months[d.getUTCMonth()]} ${d.getFullYear()}`,
        d.toISOString().split("T")[1].split(".")[0],
    ];
};
const Audio = ({ index, name, refresh }: AudioProps) => {
    const [progress, setProgress] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);

    const getProgress = useCallback((status: AVPlaybackStatus) => {

        if (status.isLoaded) {
            if (status.didJustFinish) {
                console.log("finished");
                setIsPlaying(false);
                setProgress(0);
                return;
            }

            setProgress(status.positionMillis / status.durationMillis);
            console.log(
                "progress: ",
                status.positionMillis / status.durationMillis
            );
        }
    }, []);

    const playSound = usePlaySound(getProgress);

    const [date, time] = extractDate(extractFileName(name));

    return (
        <View>
            <View className="bg-gray-300 p-4 rounded-t-lg flex flex-row  items-center">
                <View className="flex-1">
                    <Text className="text-2xl font-bold">
                        Recording #{index}
                    </Text>
                    <Text className="text-lg text-gray-500">
                        {date} | {time}
                    </Text>
                </View>

                <View className="flex flex-row self-end">
                    <IconButton
                        className=""
                        icon={isPlaying ? "pause" : "play"}
                        iconColor="green"
                        onPress={() => {
                            setIsPlaying(true);
                            playSound({ uri: name });
                        }}
                    />
                    <IconButton
                        className=" "
                        icon="delete"
                        iconColor="red"
                        onPress={() => {
                            FileSystem.deleteAsync(name).then(() => refresh());
                        }}
                    />
                </View>
            </View>
            <View
                className="rounded-b-lg bg-gray-200"
                style={{
                    width: "100%",
                    height: 10,
                    overflow: "hidden",
                }}
            >
                <MotiView
                    style={{
                        height: "100%",
                        backgroundColor: "red",
                    }}
                    animate={{
                        width: `${progress * 100}%`,
                        opacity: isPlaying ?  1 : 0,
                    }}
                    transition={{
                        type: "timing",
                        duration: 400,
                    }}
                />
            </View>
        </View>
    );
};

export default ProfilePage;
