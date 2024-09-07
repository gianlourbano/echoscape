import PageContainer from "@/components/PageContainer";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";



export type POIDetailsPageProps = {
    poi: string;
    name?: string;
    wikidata?: string;
    wikipedia?: string;
    latitude?: string;
    longitude?: string;
    songs?: string;
}

export function POIDetailsObjToURL(poi: POIDetailsPageProps): string {
    return `/poi/${poi.poi}`;
}

export default function POIDetailsPage({}) {
    const { poi, name, wikidata, wikipedia, latitude, longitude } =
        useLocalSearchParams<POIDetailsPageProps>();

    return (
        <PageContainer>
            <Text>POI Details</Text>
            <Text>{poi}</Text>
        </PageContainer>
    );
}
