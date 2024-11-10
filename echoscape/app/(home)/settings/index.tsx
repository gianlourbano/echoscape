import PageContainer from "@/components/PageContainer";
import { useAuth } from "@/utils/auth/AuthProvider";
import { Canvas, useImage, Image } from "@shopify/react-native-skia";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { IconButton } from "react-native-paper";
import { Image as ImageR } from "expo-image";
import {
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";

const SettingsContainer = ({
    children,
    title,
    className,
}: {
    children?: React.ReactNode;
    title: string;
    className?: string;
}) => {
    return (
        <View className={`bg-zinc-800 p-2 rounded-md ${className}`}>
            <Text className="text-green-600 text-xl font-bold">{title}</Text>
            {children}
        </View>
    );
};

export default function SettingsPage() {
    const { user, withAuthFetch, dispatch } = useAuth();

    return (
        <PageContainer safe className="p-4">
            <View className="flex flex-row gap-2 items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <IconButton icon="arrow-left" />
                </TouchableOpacity>
                <Text className="text-green-600 text-2xl font-bold">
                    Settings
                </Text>
            </View>
            <View  className="mb-2 bg-zinc-400 rounded-md">
                <ImageR
                    source={require("@/assets/logo.png")}
                    style={{ width: "100%", height: 200 }}
                />
            </View>
            <ScrollView>
                <View className="flex flex-col gap-2">
                    <SettingsContainer
                        title="Account"
                        className="flex flex-col "
                    >
                        <TouchableOpacity
                            onPress={async () => {
                                dispatch("logout");
                            }}
                            className="flex flex-row items-center rounded-md self-start pr-4"
                        >
                            <IconButton icon="logout" />
                            <Text className="text-white text-lg font-bold">
                                Logout
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={async () => {
                                await withAuthFetch(
                                    `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/auth/delete`,
                                    {
                                        method: "DELETE",
                                    }
                                );
                            }}
                            className=" flex flex-row items-center rounded-md self-start"
                        >
                            <IconButton icon="delete" />
                            <Text className="text-white text-lg font-bold">
                                Delete Account
                            </Text>
                        </TouchableOpacity>
                    </SettingsContainer>
                    <SettingsContainer title="About">
                        <Text className="text-white text-lg">
                            Echoscape v0.1.0
                        </Text>
                        <Text className="text-white text-lg">
                            © 2024 Echoscape
                        </Text>
                    </SettingsContainer>
                </View>
            </ScrollView>
        </PageContainer>
    );
}

export const RotatingLogo = () => {
    const [canvasSize, setCanvasDims] = useState({ width: 0, height: 0 });
    const rotation = useSharedValue(0);

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

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 5000, easing: Easing.linear }),
            -1
        );
    }, []);

    const logo = useImage(require("@/assets/image.png"));

    return (
        <View
            className="flex-1"
            onLayout={(e) => {
                setCanvasDims({
                    width: e.nativeEvent.layout.width,
                    height: e.nativeEvent.layout.height,
                });
            }}
        >
            <Canvas style={{ width: "100%", height: "100%" }}>
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
        </View>
    );
};
