import PageContainer from "@/components/PageContainer";
import { Href, Link, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/utils/auth/AuthProvider";
import { useAudioDB } from "@/utils/sql/sql";
import { useState } from "react";
import { AudioPlayer } from "@/components/Audio/AudioPlayer";
import { Pie, PolarChart } from "victory-native";
import { getPOIsAssociatedToPoint } from "@/utils/overpass/POIsAudios_Associations";
import { POIDetailsObjToURL } from "../poi/[poi]";

// TODO: add charts and styling

interface BackendData {
    creator_username: string;
    latitude: number;
    longitude: number;
    tags: {
        bpm: number;
        danceability: number;
        loudness: number;
        mood: Record<string, number>;
        genre: Record<string, number>;
        instrument: Record<string, number>;
        orderedMood: { x: string; y: number }[];
        orderedGenre: { x: string; y: number; color?: string }[];
        orderedInstrument: { x: string; y: number }[];
    };
}

interface useFetchData<T> {
    data: T;
    error: any;
    isLoading: boolean;
}

const colors = [
    "#86efac",
    "#4ade80",
    "#22c55e",
    "#22c55e",
    "#22c55e",
    "#15803d",
    "#166534",
    "#14532d",
    "#059669",
    "#14b8a6",
];

export default function SongPage() {
    const { songid } = useLocalSearchParams();

    const { user } = useAuth();
    const { getAudioFromBackendID } = useAudioDB();
    const [localURI, setLocalURI] = useState<string | null>(null);

    const [associatedPOIs, setAssociatedPOIs] = useState<{
        id: number,
        lat: Number,
        lon: number,
        tags: {
            name: string,
            wikidata: string,
            wikipedia: string
        }
    }[]>()

    const { data, error, isLoading }: useFetchData<BackendData> = useFetch(
        `/audio/${songid}`,
        {
            postProcess: async (data: BackendData) => {
                //console.log("DEBUG POSTPROCESS SONGID DATA: ", data)
                if (data.creator_username === user.username) {
                    data.creator_username = "You";
                    setLocalURI(await getAudioFromBackendID(Number(songid)));
                } else {
                    data.creator_username = `@${data.creator_username}`;
                }

                data.tags.orderedMood = Object.entries(data.tags.mood)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([key, value]) => {
                        return { x: key, y: value };
                    });

                data.tags.orderedGenre = Object.entries(data.tags.genre)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 9)
                    .map(([key, value]) => {
                        return { x: key, y: value };
                    });

                data.tags.orderedGenre.push({
                    x: "other",
                    y:
                        1 -
                        data.tags.orderedGenre.reduce(
                            (acc, curr) => acc + curr.y,
                            0
                        ),
                });

                // shuffle color array
                colors.sort(() => Math.random() - 0.5);

                data.tags.orderedGenre = data.tags.orderedGenre.map(
                    (g, index) => {
                        return {
                            x: g.x,
                            y: g.y,
                            // assign each genre a color

                            color: colors[index],
                        };
                    }
                );

                data.tags.orderedInstrument = Object.entries(
                    data.tags.instrument
                )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([key, value]) => {
                        return { x: key, y: value };
                    });
                
                const fetchedPOIs = await getPOIsAssociatedToPoint({
                    latitude: data.latitude,
                    longitude: data. longitude
                })
                setAssociatedPOIs(
                    fetchedPOIs
                )
                console.log("DEBUG FETCHEDPOIS: ", fetchedPOIs)

                return data;
            },
        }
    );

    const [poiURL, setPoiURL] = useState<String>("")



    if(isLoading) {
        return <View className="h-full bg-zinc-700"></View>
    }

    if(error) {
        return <Text>Error: {error}</Text>
    }

    return (
        <PageContainer className="pb-0 bg-zinc-700 h-full flex flex-col gap-4 w-full">
            <Text className="mt-2 text-4xl font-bold text-white">
                Audio #{songid}{" "}
                <Text className="text-lg text-white font-normal">
                    by {data.creator_username}
                </Text>
            </Text>
            
            <ScrollView>
                
                <View className="flex flex-col gap-4 w-full h-full">
                    <View className="flex flex-row gap-4 w-full">
                        <View className="bg-zinc-800 rounded-lg  p-4">
                            <Text className="text-green-600 font-bold text-4xl">
                                BPM
                            </Text>
                            <Text className="text-white text-xl">
                                {data.tags.bpm}
                            </Text>
                        </View>
                        <View className="bg-zinc-800 rounded-lg p-4 flex-1">
                            <Text className="text-green-600 font-bold text-4xl">
                                Loudness
                            </Text>
                            <Text className="text-white text-xl">
                                {Math.round(data.tags.loudness)}%
                            </Text>
                        </View>
                    </View>
                    <View className="bg-zinc-800 rounded-lg p-4 w-full">
                        <Text className="text-green-600 font-bold text-4xl">
                            Danceability
                        </Text>
                        <Text className="text-white text-xl">
                            {Math.round(data.tags.danceability * 100)}%
                        </Text>
                    </View>
                    {localURI && <AudioPlayer uri={localURI} />}
                    <View className="bg-zinc-800 rounded-lg p-4">
                    <Text className="text-4xl font-bold text-green-600">
                        Associated POI
                    </Text>
                        {associatedPOIs && associatedPOIs.length > 0 ?
                        <Link className="text-white"
                            href={
                                POIDetailsObjToURL({
                                    poi: String(associatedPOIs[0].id),
                                    name: associatedPOIs[0].tags.name,
                                    wikidata: associatedPOIs[0].tags.wikidata,
                                    wikipedia: associatedPOIs[0].tags.wikipedia,
                                    latitude: associatedPOIs[0].lat.toString(),
                                    longitude: associatedPOIs[0].lon.toString(),
                                }) as unknown as Href<string>
                            }
                        >
                            {associatedPOIs[0].tags.name}
                        </Link>
                        :
                        <></>
                        }


                    </View>
                    <View className="bg-zinc-800 rounded-lg p-4">
                        <Text className="text-4xl font-bold text-green-600">
                            Genres
                        </Text>
                        <View className="flex flex-row items-center my-4">
                            <View className="flex-1">
                                <PolarChart
                                    data={data.tags.orderedGenre}
                                    labelKey={"x"}
                                    valueKey={"y"}
                                    colorKey={"color"}
                                    containerStyle={{
                                    }}
                                >
                                    <Pie.Chart innerRadius={20}>
                                        {({ slice }) => (
                                            <>
                                                <Pie.Slice />
                                                <Pie.SliceAngularInset
                                                    angularInset={{
                                                        angularStrokeWidth: 5,
                                                        angularStrokeColor:
                                                            "#27272a",
                                                    }}
                                                />
                                            </>
                                        )}
                                    </Pie.Chart>
                                </PolarChart>
                            </View>
                            <View className="">
                                {data.tags.orderedGenre.map((genre, index) => (
                                    <View className="flex flex-row gap-1 items-center"
                                        key={genre.x + index}
                                    >
                                        <View
                                            className="h-2 w-2 rounded-sm"
                                            style={{
                                                backgroundColor: genre.color,
                                            }}
                                        />
                                        <Text className="text-white ">
                                            {genre.x}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                    <View className="bg-zinc-800 rounded-lg p-4">
                        <Text className="text-4xl font-bold text-green-600">
                            Instruments
                        </Text>

                        <View className="flex flex-col gap-2 p-4">
                            {data.tags.orderedInstrument.map((inst) => (
                                <View className="flex flex-row-reverse gap-2 w-full"
                                    key={inst.x}
                                >
                                    <View
                                        style={{ width: `${inst.y * 100}%` }}
                                        className="bg-green-600 px-4 py-1 rounded-md h-6"
                                        key={inst.x}
                                    ></View>
                                    <Text className="text-white">{inst.x}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View className="bg-zinc-800 rounded-lg p-4">
                        <Text className="text-4xl font-bold text-white">
                            Moods
                        </Text>

                        <View className="flex flex-col gap-2 p-4">
                            {data.tags.orderedMood.map((mood) => (
                                <View className="flex flex-row gap-2 w-full"
                                    key={mood.x}
                                >
                                    <View
                                        style={{ width: `${mood.y * 100}%` }}
                                        className="bg-green-600 px-4 py-1 rounded-md h-6"
                                        key={mood.x}
                                    ></View>
                                    <Text className="text-white">{mood.x}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View className="h-20" />
                </View>
                

            </ScrollView>
        </PageContainer>
    );
}

/**
 * 
 * <Text variant="titleLarge">song #{songid}</Text>
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
 */
