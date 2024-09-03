import PageContainer from "@/components/PageContainer";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { useFetch } from "@/hooks/useFetch";

export default function SongPage() {
    const { songid } = useLocalSearchParams();

    const { data, error, isLoading } = useFetch(`/audio/${songid}`);

    return (
        <PageContainer>
            <Text>song #{songid}</Text>
            <Text>{JSON.stringify(data, null, 2)}</Text>
        </PageContainer>
    );
}
