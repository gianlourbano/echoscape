import PageContainer from "@/components/PageContainer";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useFetch } from "@/hooks/useFetch";
import { CartesianChart, Line } from "victory-native";

export default function SongPage() {
    const { songid } = useLocalSearchParams();

    const { data, error, isLoading } = useFetch(`/audio/${songid}`);

    const DATA = Array.from({ length: 31 }, (_, i) => ({
        day: i,
        highTmp: 40 + 30 * Math.random(),
    }));

    return (
        <PageContainer className="p-10">
            <Text>song #{songid}</Text>
            {isLoading ? <Text>Loading...</Text>: <Text>{JSON.stringify(data, null, 2)}</Text>}
            <View style={{ height: 300, padding: 20 }}>
                <CartesianChart
                    data={DATA}
                    xKey="day"
                    yKeys={["highTmp"]}
                    // 👇 pass the font, opting in to axes.
                    axisOptions={{}}
                    >
                    {({ points }) => (
                        <Line
                            points={points.highTmp}
                            color="red"
                            strokeWidth={3}
                        />
                    )}
                </CartesianChart>
            </View>
        </PageContainer>
    );
}
