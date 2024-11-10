import { View } from "react-native";

import { Text } from "moti";

import { Redirect, SplashScreen, Stack } from "expo-router";
import { useAuth } from "@/utils/auth/AuthProvider";

export default function App() {
    
    const { status } = useAuth();

    if (status === "loading") {
        return <View className="flex justify-center items-center flex-1"><Text>Loading...</Text></View>;
    }

    if (status === "unauthenticated") {
        SplashScreen.hideAsync();
        return <Redirect href="/login" />;
    }

    SplashScreen.hideAsync();

    
    return (
        <Stack
            initialRouteName="(tabs)"
            screenOptions={{
                headerTitle: "Echoscape",
                //headerTransparent: true,
                headerShown: false
            }}
        >
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen name="song/[songid]" options={{ presentation: "modal" }} />
            <Stack.Screen name="poi/[poi]" options={{ presentation: "modal" }} />
            <Stack.Screen name="debug/index" options={{presentation: "modal"}} />
            <Stack.Screen name="report/index" options={{presentation: "modal"}} />
            <Stack.Screen name="settings/index" options={{presentation: "card"}} />
        </Stack>
    );
}
