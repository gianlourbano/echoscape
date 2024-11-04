import { SafeAreaView, StyleSheet, View } from "react-native";

export default function PageContainer({
    children,
    className,
}: {
    children?: any;
    className?: string;
}) {
    return (
        <SafeAreaView className={`bg-zinc-700 h-full ${className}`}>
            <View className={` p-4 ${className}`} >
                {children}
            </View>
        </SafeAreaView>
    );
}
