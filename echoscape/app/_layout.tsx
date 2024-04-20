import { Slot } from "expo-router";

import "../global.css";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/utils/auth/AuthProvider";

export default function RootLayout() {
    return (
        <AuthProvider>
            <PaperProvider>
                <Slot />
            </PaperProvider>
        </AuthProvider>
    );
}
