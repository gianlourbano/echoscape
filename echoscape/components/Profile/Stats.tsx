import { View, Text, ScrollView } from "react-native";
import { useAuth } from "@/utils/auth/AuthProvider";
import { useAudioDB, BackendAudioData } from "@/utils/sql/sql";
import { useState, useEffect } from "react";

type CrunchStatus = "idle" | "crunching" | "done";

interface TileData {
    text: string;
    percentage: string;
}

export const Stats = () => {
    const { user } = useAuth();

    const [tiles, setTiles] = useState<TileData[]>([]);
    const [genres, setGenres] = useState<Record<string, number>>({});
    const [topGenre, setTopGenre] = useState<string>("");

    const { getAudioData } = useAudioDB();

    const [crunchingStatus, setCrunchingStatus] =
        useState<CrunchStatus>("idle"); // porcodio

    const crunchData = async () => {
        setCrunchingStatus("crunching");
        const data = (await getAudioData()).map((audio) =>
            JSON.parse(audio.backendData)
        ) as BackendAudioData[];
        console.log(JSON.stringify(data, null, 2));

        const tiles: TileData[] = [];

        const total_audios = data.length;

        const danceable = data.reduce(
            (acc, curr) => acc + (curr.danceability >= 0.7 ? 1 : 0),
            0
        );

        const percentage_danceability = (danceable / total_audios) * 100;

        tiles.push({
            text: "of your tracks are danceable",
            percentage: `${percentage_danceability}%`,
        });

        const average_bpm =
            data.reduce((acc, curr) => acc + curr.bpm, 0) / total_audios;

        tiles.push({
            text: "average BPM",
            percentage: `${average_bpm}`,
        });

        // pick two random moods

        const moods = Object.keys(data[0].mood);

        const mood1 = moods[Math.floor(Math.random() * moods.length)];
        const mood2 = moods[Math.floor(Math.random() * moods.length)];

        const mood1_percentage =
            data.reduce(
                (acc, curr) => acc + (curr.mood[mood1] >= 0.25 ? 1 : 0),
                0
            ) / total_audios;
        const mood2_percentage =
            data.reduce(
                (acc, curr) => acc + (curr.mood[mood2] >= 0.25 ? 1 : 0),
                0
            ) / total_audios;

        tiles.push({
            text: `of your tracks are ${mood1}`,
            percentage: `${mood1_percentage}%`,
        });

        tiles.push({
            text: `of your tracks are ${mood2}`,
            percentage: `${mood2_percentage}%`,
        });

        // get top 5 genres for each track

        const genres = data.map((audio) => audio.genre);

        const top_5_genres = genres.map((audio) => {
            return Object.entries(audio)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
        });

        const genre_counts = top_5_genres.flat().reduce((acc, curr) => {
            if (acc[curr[0]]) {
                acc[curr[0]] += 1;
            } else {
                acc[curr[0]] = 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // get top 5 genres

        const top_5 = Object.entries(genre_counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // transform this into an object

        setGenres(
            top_5.reduce((acc, curr) => {
                acc[curr[0]] = (curr[1] / total_audios) * 100;
                return acc;
            }, {} as Record<string, number>)
        );

        console.log(top_5);

        setCrunchingStatus("done");

        setTiles(tiles);
    };

    useEffect(() => {
        crunchData();
    }, []);

    if(crunchingStatus !== "done") {
        return <Text>Crunching...</Text>
    }

    return (
        <View className="p-4 flex flex-col gap-4">
            <View className="bg-zinc-800 rounded-lg p-4">
                <Text className="text-4xl font-bold text-white">Genres</Text>
                <Text className="p-2 text-white text-xl">
                    Your top genre is{" "}
                    <Text className="font-bold text-green-600 ">
                        {Object.keys(genres)[0]}
                    </Text>
                    , appearing in{" "}
                    <Text className="font-bold">
                        {Object.entries(genres)[0][1]}%
                    </Text>{" "}
                    of your songs
                </Text>
                <View className="flex flex-col gap-2 p-4">
                    {Object.entries(genres).map(([genre, count]) => (
                        <View
                            style={{ width: `${count}%` }}
                            className="bg-green-600 px-4 py-1 rounded-md"
                        >
                            <Text key={genre} className="text-white">
                                {genre}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
            <ScrollView className="rounded-md" horizontal>
                {tiles.map((i) => (
                    <View
                        className="h-40 w-40 bg-zinc-800 rounded-lg mr-4 p-4"
                        key={i.text}
                    >
                        <Text className="text-green-600 font-bold text-4xl">
                            {i.percentage}
                        </Text>
                        <Text className="text-white text-xl">{i.text}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
