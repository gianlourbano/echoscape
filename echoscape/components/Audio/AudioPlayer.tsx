import { View } from "react-native";
import { AVPlaybackStatus } from "expo-av";
import { useCallback, useState } from "react";
import { usePlaySound } from "@/hooks/useSound";
import { IconButton } from "react-native-paper";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    LinearTransition,
} from "react-native-reanimated";

export const AudioPlayer = ({ uri }: { uri: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const progress = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return { 
            width: `${(progress.value * 100)}%`,
            borderRadius: 5
    };  
    });

    const getProgress = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            if (status.didJustFinish) {
                setIsPlaying(false);
                setTimeout(() => {
                    progress.value = 0;
                }, 500)
                return;
            }

            progress.value = status.positionMillis / status.durationMillis;
        }
    };

    const {playSound, sound} = usePlaySound(getProgress);

    return (
        <Animated.View className="flex flex-row items-center" layout={LinearTransition}>
            <Animated.View className="h-3 bg-zinc-600 rounded-md flex-1" layout={LinearTransition}>
                <Animated.View
                    className="h-full bg-green-600 rounded-md transition-all"
                    style={animatedStyle}
                    layout={LinearTransition}
                />
            </Animated.View>
            <IconButton
                icon={isPlaying ? "pause" : "play"}
                iconColor="green"
                onPress={async () => {
                    if(isPlaying) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                    }
                    else {
                        console.log(uri);
                        await playSound({uri});
                        setIsPlaying(true);
                    }
                }}
            />
        </Animated.View>
    );
};
