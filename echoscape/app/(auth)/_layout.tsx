import { useAuth } from "@/utils/auth/AuthProvider";
import { Slot, router } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";

export default function AuthLayout() {
    return (
        <SafeAreaView className="bg-gray-800">
            <Slot />
        </SafeAreaView>
    );
}
