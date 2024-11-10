import { View } from "react-native";
import { AVPlaybackStatus } from "expo-av";
import { useCallback, useState } from "react";
import { usePlaySound } from "@/hooks/useSound";
import { IconButton } from "react-native-paper";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    LinearTransition,
    withTiming,
    Easing,
    useAnimatedGestureHandler,
    runOnJS,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";

export const AudioPlayer = ({ uri }: { uri: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const progress = useSharedValue(0);

    const sliderWidth = useSharedValue(0);
    const handleWidth = 8; // Width of the handle
    const isDragged = useSharedValue(false);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: isDragged
                ? `${progress.value * 100}%`
                : withTiming(`${progress.value * 100}%`, {
                      easing: Easing.linear,
                  }),
            borderRadius: 5,
        };
    });

    const getProgress = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            if (status.didJustFinish) {
                setIsPlaying(false);
                setTimeout(() => {
                    progress.value = 0;
                }, 500);
                status.positionMillis = 0;
                return;
            }

            progress.value = status.positionMillis / status.durationMillis;
        }
    };

    const { playSound, sound, duration } = usePlaySound(getProgress);

    const pauseSound = useCallback(async () => {
        if (sound) {
            setIsPlaying(false);
            await sound.pauseAsync();
        }
    }, [sound]);

    const setSoundPos = useCallback(
        async (progress) => {
            if (sound) {
                setIsPlaying(true);
                await sound.setStatusAsync({
                    positionMillis: progress * duration,
                    shouldPlay: true,
                });
            }
        },
        [sound, duration]
    );

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            isDragged.value = true;
            runOnJS(pauseSound)();
        })
        .onUpdate((event) => {
            console.log("Slider: ", sliderWidth.value);
            if (sliderWidth.value > 0) {
                const newProgress = Math.min(
                    Math.max(event.x / sliderWidth.value, 0),
                    1
                );
                progress.value = newProgress;
                console.log(newProgress);
            }
        })
        .onFinalize(() => {
            console.log("Pan Finalize");
            isDragged.value = false;

            runOnJS(setSoundPos)(progress.value);
        });

    return (
        <Animated.View
            className="flex flex-row items-center"
            layout={LinearTransition}
        >
            <GestureHandlerRootView>
                <Animated.View
                    style={{height: 10}}
                    className="h-4 bg-zinc-600 rounded-md "
                    layout={LinearTransition}
                    onLayout={(event) => {
                        console.log(event.nativeEvent.layout.height);
                        sliderWidth.value = event.nativeEvent.layout.width;
                    }}
                >
                    <GestureDetector gesture={panGesture}>
                        <Animated.View
                            className="h-full bg-green-600 rounded-md transition-all flex flex-row-reverse"
                            style={animatedStyle}
                            // layout={LinearTransition}
                        >
                            <View className="w-8 h-full">
                                <View className="absolute h-8 w-8 translate-x-4 translate-y-[-8] rounded-full"></View>
                            </View>
                            {/* <View className="absolute left-0 h-full w-8 bg-green-700 rounded-md"></View> */}
                        </Animated.View>
                    </GestureDetector>
                </Animated.View>
            </GestureHandlerRootView>
            <IconButton
                icon={isPlaying ? "pause" : "play"}
                iconColor="green"
                onPress={async () => {
                    if (isPlaying) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                    } else {
                        console.log(uri);
                        await playSound({ uri });
                        setIsPlaying(true);
                    }
                }}
            />
        </Animated.View>
    );
};
