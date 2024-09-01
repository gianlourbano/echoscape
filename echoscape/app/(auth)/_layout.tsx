import { useAuth } from "@/utils/auth/AuthProvider";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";

export default function AuthLayout() {
    
    const {status} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if(status === "authenticated") {
            router.push("index");
        }
    }, [])

    return (
        <SafeAreaView className="bg-gray-800">
            <Slot />
        </SafeAreaView>
    );
}
