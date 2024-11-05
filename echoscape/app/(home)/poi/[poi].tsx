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
    const wikidataId = poi.wikidata
        ? poi.wikidata.startsWith('https://www.wikidata.org/wiki/')
            ? poi.wikidata.slice(30)
            : poi.wikidata
        : poi.poi; // Fallback to 'poi.poi' if 'wikidata' is not available

    let url = `/poi/${poi.poi}`;

    const params = new URLSearchParams();

    if (poi.name) params.append('name', poi.name);
    if (poi.wikipedia) params.append('wikipedia', poi.wikipedia);
    if (poi.latitude) params.append('latitude', poi.latitude);
    if (poi.longitude) params.append('longitude', poi.longitude);
    if (poi.songs) params.append('songs', poi.songs);

    const queryString = params.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
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
