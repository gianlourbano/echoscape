import safe_area_view from "@/utils/styles/safe_area_view";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function PageContainer({
    children,
    className,
    safe = false,
}: {
    children?: any;
    className?: string;
    safe?: boolean;
}) {
    if (safe)
        return (
            <SafeAreaView 
                className="bg-zinc-700"
                style={safe_area_view.AndroidSafeArea}
            >
                <View className={`bg-zinc-700 h-full ${className}`}>
                    {children}
                </View>
            </SafeAreaView>
        );

    return (
        <View className={`bg-zinc-700 h-full p-4 ${className}`}>
            {children}
        </View>
    );
}
