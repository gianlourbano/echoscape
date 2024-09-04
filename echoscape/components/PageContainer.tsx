import { SafeAreaView, StyleSheet, View } from "react-native";

export default function PageContainer({
    children,
    className,
}: {
    children: any;
    className?: string;
}) {
    return (
        <SafeAreaView className={`${className}`}>
            <View className={`${className}`} style={styles.container}>
                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
});
