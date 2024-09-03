import { View } from "react-native";

import { SafeAreaView, Text } from "moti";

import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/utils/auth/AuthProvider";

export default function App() {
    
    const { status } = useAuth();

    if (status === "loading") {
        return <View className="flex justify-center items-center flex-1"><Text>Loading...</Text></View>;
    }

    if (status === "unauthenticated") {
        return <Redirect href="/login" />;
    }

    
    return (
        <Stack
            initialRouteName="(tabs)"
            screenOptions={{
                headerTitle: "Echoscape",
                //headerTransparent: true,
            }}
        >
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen name="song/[songid]" options={{ presentation: "modal" }} />
            <Stack.Screen name="debug/index" options={{presentation: "modal"}} />
        </Stack>
    );
}
