import PageContainer from "@/components/PageContainer";
import { Stats } from "@/components/Profile/Stats";
import { useRouter } from "expo-router";
import { Text, ScrollView, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatsPage() {
    const { navigate } = useRouter();

    return (
        <PageContainer className="bg-zinc-700 h-full px-4" safe>
            <View className="flex flex-row my-2 items-center">
                <Text className="text-4xl text-white font-bold flex-1">
                    Stats
                </Text>
                <Button
                    className="bg-zinc-800"
                    mode="contained"
                    theme={{
                        roundness: 1,
                        colors: {
                            primary: "#27272a",
                        },
                    }}

                    onPress={() => navigate("/report")}
                >
                    <Text className="text-green-600">Report</Text>
                </Button>
            </View>
            <ScrollView>
                <Stats />
            </ScrollView>
        </PageContainer>
    );
}
