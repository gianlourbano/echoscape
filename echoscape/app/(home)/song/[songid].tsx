import PageContainer from "@/components/PageContainer";
import { useLocalSearchParams } from "expo-router";
import { View, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useFetch } from "@/hooks/useFetch";

// TODO: add charts and styling

interface BackendData {
    creator_username: string;
    tags: {
        bpm: number;
        danceability: number;
        loudness: number;
        mood: Record<string, number>;
        genre: Record<string, number>;
        instrument: Record<string, number>;
    };
}

interface useFetchData<T> {
    data: T;
    error: any;
    isLoading: boolean;
}

export default function SongPage() {
    const { songid } = useLocalSearchParams();

    const { data, error, isLoading }: useFetchData<BackendData> = useFetch(
        `/audio/${songid}`
    );

    return isLoading ? (
        <Text>Loading...</Text>
    ) : (
        <PageContainer className="p-10 bg-zinc-800 h-full flex flex-col gap-2">
            <Text variant="titleLarge">song #{songid}</Text>
            <ScrollView>
                <Text>Uploaded by @{data.creator_username}</Text>
                <Text>Bpm: {data.tags.bpm}</Text>
                <Text>Danceability: {data.tags.danceability}</Text>
                <Text>Loudness: {data.tags.loudness}</Text>
                <View className="flex m-4">
                    <Text>Top 5 moods:</Text>
                    {Object.entries(data.tags.mood)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([key, value]) => {
                            return (
                                <Text key={key}>
                                    {key}: {value}
                                </Text>
                            );
                        })}
                </View>
                <View className="flex m-4">
                    <Text>Top 5 genres:</Text>
                    {Object.entries(data.tags.genre)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([key, value]) => {
                            return (
                                <Text key={key}>
                                    {key}: {value}
                                </Text>
                            );
                        })}
                </View>
                <View className="flex m-4">
                    <Text>Top 5 instruments:</Text>
                    {Object.entries(data.tags.instrument)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([key, value]) => {
                            return (
                                <Text key={key}>
                                    {key}: {value}
                                </Text>
                            );
                        })}
                </View>
            </ScrollView>
        </PageContainer>
    );
}
