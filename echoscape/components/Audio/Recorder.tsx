import {
    Canvas,
    Circle,
    Image,
    Path,
    Rect,
    Skia,
    useImage,
} from "@shopify/react-native-skia";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { getUserTmpUri } from "@/utils/fs/fs";
import * as FileSystem from "expo-file-system";

export function Recorder({
    isRecording,
    onPressStart,
    onPressStop,
    onNewAudioReady,
}: {
    isRecording: boolean;
    onPressStart: () => void;
    onPressStop: () => void;
    onNewAudioReady: () => void;
}) {
    const buttonStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: !isRecording
                    ? withDelay(200, withSpring(isRecording ? 1.2 : 1, {}))
                    : withSpring(isRecording ? 1.2 : 1, {}),
            },
        ],
    }));

    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const recording = useRef<Audio.Recording | null>(null);
    const MAX_DURATION = 30000; // Maximum recording duration in milliseconds

    // Animated value for progress (0 to 1)
    const progress = useSharedValue(0);
    const rotation = useSharedValue(0);
    const radius = useSharedValue(30);

    const logo = useImage(require("@/assets/image.png"));

    const imageTransform = useDerivedValue(() => {
        const radians = (rotation.value * Math.PI) / 180;
        return [
            { translateX: canvasSize.width / 2 + 50 },
            { translateY: canvasSize.height / 2 + 50 },
            {
                rotate: radians,
            },
            { translateX: canvasSize.width / 2 - 50 },
            { translateY: canvasSize.height / 2 - 50 },
        ];
    }, [rotation]);

    const numRects = 20;
    const rectHeights = Array.from({ length: numRects }, () =>
        useSharedValue(0)
    );
    const yValues = rectHeights.map((heightValue) =>
        useDerivedValue(
            () => canvasSize.height - heightValue.value,
            [heightValue, canvasSize.height]
        )
    );

    const onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
        if (status.metering !== undefined && status.metering !== null) {
            const meteringValue = status.metering; // Negative decibels
            const normalizedMetering = (meteringValue + 160) / 160; // Normalize between 0 and 1
            const maxHeight = canvasSize.height;
            // Update each rectangle's height
            rectHeights.forEach((heightValue) => {
                heightValue.value = withTiming(
                    normalizedMetering * maxHeight * (Math.random() * 1),
                    {
                        easing: Easing.linear,
                    }
                ); // Add some randomness
            });
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timer;

        const startRecording = async () => {
            try {
                await Audio.requestPermissionsAsync();
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording: newRec } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY,
                    onRecordingStatusUpdate,
                    300
                );

                recording.current = newRec;

                await recording.current.startAsync();

                // Update the recording duration every 100ms
                interval = setInterval(async () => {
                    if (recording.current) {
                        const status = await recording.current.getStatusAsync();
                        if (status.isRecording) {
                            const duration = status.durationMillis || 0;

                            // Update progress (from 0 to 1)
                            const normalizedProgress = Math.min(
                                duration / MAX_DURATION,
                                1
                            );
                            progress.value = withTiming(normalizedProgress, {
                                easing: Easing.linear,
                            });

                            if (duration >= MAX_DURATION) {
                                onPressStop();
                            }
                        }
                    }
                }, 100);
            } catch (error) {
                console.error(error);
            }
        };

        const stopRecording = async () => {
            if (recording.current) {
                clearInterval(interval);
                progress.value = withSpring(0);

                const uri = recording.current.getURI();
                console.log("Recording saved to: ", uri);
                if (uri) {
                    const dir = await getUserTmpUri();
                    const filename = `recording-${Date.now()}.m4a`;
                    const to = `${dir}/${filename}`;

                    await FileSystem.moveAsync({
                        from: uri,
                        to: to,
                    });
                }

                await recording.current.stopAndUnloadAsync();
                recording.current = null;

                onNewAudioReady();
            }
        };

        (async () => {
            if (isRecording) {
                startRecording();

                // Start rotating the image
                rotation.value = withRepeat(
                    withTiming(360, { duration: 3000, easing: Easing.linear }),
                    -1
                );
                radius.value = withSpring(50);
            } else {
                await stopRecording();
                rectHeights.forEach((heightValue) => {
                    heightValue.value = withTiming(0, {
                        easing: Easing.linear,
                    });
                });
                rotation.value = withSpring(0);
                radius.value = withSpring(30);
            }
        })();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

    // Computed value for the progress path
    const progressPath = useDerivedValue(() => {
        const cx = canvasSize.width / 2;
        const cy = canvasSize.height / 2;
        const r = radius.value; // Radius of the outer circle
        const startAngle = -Math.PI / 2; // Start at the top
        const endAngle = startAngle + 2 * Math.PI * progress.value;

        const path = Skia.Path.Make();
        path.addArc(
            { x: cx - r, y: cy - r, width: r * 2, height: r * 2 },
            startAngle * (180 / Math.PI),
            progress.value * 360
        );
        return path;
    }, [progress, canvasSize, radius]);

    return (
        <View
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#3f3f46",
            }}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setCanvasSize({ width, height });
            }}
        >
            <TouchableOpacity
                onPress={isRecording ? onPressStop : onPressStart}
                className="h-full"
                style={{ height: "100%" }}
            >
                <Animated.View style={buttonStyle}>
                    <Canvas
                        style={{
                            width: canvasSize.width,
                            height: canvasSize.height,
                        }}
                    >
                        {rectHeights.map((heightValue, i) => {
                            const rectWidth = canvasSize.width / numRects;
                            const x = rectWidth * i;
                            return (
                                <Rect
                                    key={i}
                                    x={x}
                                    y={yValues[i]}
                                    width={rectWidth - 2} // Small gap between rects
                                    height={heightValue}
                                    color="#27272a"
                                />
                            );
                        })}
                        {/* Outer circle background */}
                        <Circle
                            cx={canvasSize.width / 2}
                            cy={canvasSize.height / 2}
                            r={radius}
                            color="#27272a"
                            strokeWidth={5}
                            style="stroke"
                        />

                        {/* Progress arc */}
                        <Path
                            path={progressPath}
                            color={isRecording ? "#16a34a" : "green"}
                            strokeWidth={5}
                            style="stroke"
                            strokeCap="round"
                        />
                        <Circle
                            cx={canvasSize.width / 2}
                            cy={canvasSize.height / 2}
                            r={45}
                            color="white"
                        />
                        <Image
                            image={logo}
                            x={canvasSize.width / 2 - 50 - 1}
                            y={canvasSize.height / 2 - 50 - 1}
                            width={100}
                            height={100}
                            origin={{
                                x: canvasSize.width / 2 - 50,
                                y: canvasSize.height / 2 - 50,
                            }}
                            transform={imageTransform}
                        />
                    </Canvas>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}
