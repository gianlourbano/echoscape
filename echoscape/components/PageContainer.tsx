import { SafeAreaView, StyleSheet, View } from "react-native";

export default function PageContainer({
    children,
    className,
}: {
    children?: any;
    className?: string;
}) {
    return (
            <View className={`bg-zinc-700 h-full p-4 ${className}`} >
                {children}
            </View>
    );
}
