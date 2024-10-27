import { AVPlaybackStatus } from "expo-av";
import { View as MotiView } from "moti";
import { Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { useState, useEffect, useCallback } from "react";
import { usePlaySound } from "@/hooks/useSound";
import * as FileSystem from "expo-file-system";
import { deleteAudioData } from "@/utils/sql/sql";

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

export interface AudioProps {
    index: number;
    name: string;
    refresh?: () => void;
}

export const extractFileName = (path: string) => {
    return path?.split("/").pop().split(".").slice(0, -1).join(".");
};

export const extractDate = (filename: string) => {
    const d = new Date(Number(filename.split("-")[1]));
    return [
        `${d.getDate()} ${months[d.getUTCMonth()]} ${d.getFullYear()}`,
        d.toISOString().split("T")[1].split(".")[0],
    ];
};

export const Audio = ({ index, name, refresh }: AudioProps) => {
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

    useEffect(() => {
        if (isPlaying) playSound({ uri: name });
    }, [isPlaying]);

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
                        }}
                    />
                    <IconButton
                        className=" "
                        icon="delete"
                        iconColor="red"
                        onPress={async () => {
                            console.log("[AUDIO] Deleting: ", name);
                            FileSystem.deleteAsync(name).then(() => refresh());
                            await deleteAudioData(name);
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
                        opacity: isPlaying ? 1 : 0,
                    }}
                />
            </View>
        </View>
    );
};
