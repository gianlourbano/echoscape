import { Slot } from "expo-router";

import "../global.css";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/utils/auth/AuthProvider";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { NetworkProvider } from "@/utils/network/NetworkProvider";

export default function RootLayout() {
    return (
        <NetworkProvider>
            <AuthProvider>
                <PaperProvider>
                    <Slot />
                </PaperProvider>
            </AuthProvider>
        </NetworkProvider>
    );
}
