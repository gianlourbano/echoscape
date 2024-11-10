import { View, Text, ScrollView, Platform, RefreshControl } from "react-native";
import { useAuth } from "@/utils/auth/AuthProvider";
import { useAudioDB, BackendAudioData } from "@/utils/sql/sql";
import { useState, useEffect, Fragment } from "react";
import { PolarChart, Pie, PieSliceData, useSlicePath } from "victory-native";
import {
    Circle,
    Fill,
    matchFont,
    Path,
    Text as SKText,
    useFont,
    useFonts,
} from "@shopify/react-native-skia";

type CrunchStatus = "idle" | "crunching" | "done" | "empty";

interface TileData {
    text: string;
    percentage: string;
}

export const Stats = () => {
    const [topTiles, setTopTiles] = useState<TileData[]>([]);
    const [tiles, setTiles] = useState<TileData[]>([]);
    const [genres, setGenres] = useState<Record<string, number>>({});

    const { getAudioData } = useAudioDB();

    const [crunchingStatus, setCrunchingStatus] =
        useState<CrunchStatus>("idle");

    const crunchData = async () => {
        setCrunchingStatus("crunching");
        const full_data = await getAudioData();

        let data = full_data.map((audio) =>
            JSON.parse(audio.backendData)
        ) as BackendAudioData[];

        // filter out eventual broken data (shouldn't happen)
        data = data.filter((audio) => audio.bpm !== undefined);

        if (data.length === 0) {
            setCrunchingStatus("empty");
            return;
        }

        topTiles.push({
            text: "Total tracks",
            percentage: `${data.length}`,
        });

        topTiles.push({
            text: "Total tracks",
            percentage: `${data.length}`,
        });

        topTiles.push({
            text: "Total tracks",
            percentage: `${data.length}`,
        });

        topTiles.push({
            text: "Total tracks",
            percentage: `${data.length}`,
        });

        const tiles: TileData[] = [];

        const total_audios = data.length;

        const danceable = data.reduce(
            (acc, curr) => acc + (curr.danceability >= 0.7 ? 1 : 0),
            0
        );

        const percentage_danceability = (danceable / total_audios) * 100;

        tiles.push({
            text: "of your tracks are danceable",
            percentage: `${Math.ceil(percentage_danceability)}%`,
        });

        const average_bpm =
            data.reduce((acc, curr) => acc + curr.bpm, 0) / total_audios;

        tiles.push({
            text: "average BPM",
            percentage: `${Math.ceil(average_bpm)}`,
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
            percentage: `${Math.ceil(mood1_percentage)}%`,
        });

        tiles.push({
            text: `of your tracks are ${mood2}`,
            percentage: `${Math.ceil(mood2_percentage)}%`,
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

        setCrunchingStatus("done");

        setTiles(tiles);
    };

    useEffect(() => {
        crunchData();
    }, []);

    if (crunchingStatus === "empty") {
        return (
            <Text className="text-white text-lg text-center">
                No data to show! Upload some audios to get started!
            </Text>
        );
    }

    if (crunchingStatus !== "done") {
        return <Text className="text-white text-lg">Crunching...</Text>;
    }

    return (
        <ScrollView>
            <RefreshControl
                refreshing={crunchingStatus === "crunching"}
                onRefresh={crunchData}
            />

            <View className="flex flex-col gap-4">
                <View></View>
                <View className="bg-zinc-800 rounded-lg p-4">
                    <Text className="text-4xl font-bold text-white">
                        Genres
                    </Text>
                    <Text className="p-2 text-white text-xl">
                        Your top genre is{" "}
                        <Text className="font-bold text-green-600 ">
                            {Object.keys(genres)[0]}
                        </Text>
                        , appearing in{" "}
                        <Text className="font-bold">
                            {Math.ceil(Object.entries(genres)[0][1])}%
                        </Text>{" "}
                        of your songs
                    </Text>
                    <View className="flex flex-col gap-2 p-4">
                        {Object.entries(genres).map(([genre, count]) => (
                            <View
                                style={{ width: `${count}%` }}
                                className="bg-green-600 px-4 py-1 rounded-md"
                                key={genre}
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
                <View className="h-80 p-2">
                    <PolarChart
                        data={DATA()} // 👈 specify your data
                        labelKey={"label"} // 👈 specify data key for labels
                        valueKey={"value"} // 👈 specify data key for values
                        colorKey={"color"} // 👈 specify data key for color
                    >
                        <Pie.Chart innerRadius={30}>
                            {({ slice }) => (
                                <Fragment>
                                    <MyCustomSlice
                                        slice={slice}
                                        minVal={125}
                                        maxVal={225}
                                    />
                                    <Pie.SliceAngularInset
                                        angularInset={{
                                            angularStrokeWidth: 5,
                                            angularStrokeColor: "#3f3f46",
                                        }}
                                    />
                                </Fragment>
                            )}
                        </Pie.Chart>
                    </PolarChart>
                </View>
            </View>
        </ScrollView>
    );
};

function MyCustomSlice({
    slice,
    minVal,
    maxVal,
}: {
    slice: PieSliceData;
    minVal: number;
    maxVal: number;
}) {
    // 👇 use the hook to generate a path object.

    const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
    const fontStyle = {
        fontFamily,
        fontSize: 14,
        fontStyle: "italic",
        fontWeight: "bold",
    } as const;

    const font = matchFont(fontStyle);

    const path = useSlicePath({
        slice: {
            ...slice,
            radius: slice.value / 2,
        },
    });

    /* 👇 experiment wtih any other customizations you want */
    return (
        <Fragment>
            <Path path={path} color={slice.color} style="fill" />
            {slice.value > 180 ? (
                <SKText
                    x={
                        slice.center.x +
                        Math.cos(
                            (slice.startAngle + slice.sweepAngle / 2) * 0.015708
                        ) *
                            130
                    }
                    y={
                        slice.center.y +
                        Math.sin(
                            (slice.startAngle + slice.sweepAngle / 2) * 0.015708
                        ) *
                            130
                    }
                    font={font}
                    text={slice.label}
                ></SKText>
            ) : null}
        </Fragment>
    );
}

// helper functions for example purposes:
function randomNumber() {
    return Math.floor(Math.random() * 100) + 125;
}
function generateRandomColor(): string {
    // Generating a random number between 0 and 0xFFFFFF
    const randomColor = Math.floor(Math.random() * 0xffffff);
    // Converting the number to a hexadecimal string and padding with zeros
    return `#${randomColor.toString(16).padStart(6, "0")}`;
}
const DATA = (numberPoints = 20) =>
    Array.from({ length: numberPoints }, (_, index) => ({
        value: randomNumber(),
        color: "#16a34a",
        label: `Label ${index + 1}`,
    }));
