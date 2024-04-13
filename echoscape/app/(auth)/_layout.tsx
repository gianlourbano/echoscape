import { Slot } from "expo-router";
import { SafeAreaView } from "react-native";

export default function AuthLayout() {
    return (
        <SafeAreaView className="bg-gray-800">
            <Slot />
        </SafeAreaView>
    );
}
