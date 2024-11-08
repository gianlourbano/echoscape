import PageContainer from "@/components/PageContainer";
import { fetchWikidataImage, useWIKI } from "@/utils/overpass/request";
import { Href, Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";

export type POIDetailsPageProps = {
    poi: string;
    name?: string;
    wikidata?: string;
    wikipedia?: string;
    latitude?: string;
    longitude?: string;
    songs?: string;
};

export function POIDetailsObjToURL(poi: POIDetailsPageProps): string {
    let url = `/poi/${poi.poi}`;

    const params = new URLSearchParams();

    if (poi.name) params.append("name", poi.name);
    if (poi.wikipedia) params.append("wikipedia", poi.wikipedia);
    if (poi.latitude) params.append("latitude", poi.latitude);
    if (poi.longitude) params.append("longitude", poi.longitude);
    if (poi.wikidata) params.append("wikidata", poi.wikidata);
    if (poi.songs) params.append("songs", poi.songs);

    const queryString = params.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
}

export const WikipediaDesc = ({ wikidata }: { wikidata: string }) => {
    const { status, wikiurl, description, isLoading } = useWIKI(wikidata, "it");

    return (
        <View className="bg-zinc-800 rounded-md p-2 flex flex-col gap-2">
            <Text className="text-xl text-green-600 font-bold">Wikipedia</Text>
            <Text className="text-white">
                {isLoading
                    ? "Loading..."
                    : description?.length > 300
                    ? description.slice(0, 300) + "..."
                    : description}
            </Text>
            {wikiurl ? (
                <View className="bg-zinc-700 rounded-md">
                    <Link href={wikiurl as Href<string>} className="w-full p-2">
                        <Text className="text-lg font bold text-white">
                            Read more
                        </Text>
                    </Link>
                </View>
            ) : null}
        </View>
    );
};

export const AssociateAudioToPOIRedirect = ({
    latitude,
    longitude,
    name
}: {
    latitude: number;
    longitude: number;
    name?: string;
}) => {
    const loc = useLocation();

    const [distance, setDistance] = useState<number>(0);

    useEffect(() => {
        if (loc)
            setDistance(haversineDistance(loc.coords, { latitude, longitude }));
    }, [loc]);

    return (
        <View className="bg-green-600 rounded-md p-2">
            {distance < 50 ? (
                <Link
                    href={`/post?lat=${latitude}&lng=${longitude}&name=${name}`}
                    className="rounded-md p-2"
                >
                    <Text className="text-lg text-white font-bold">
                        Associate Audio
                    </Text>
                </Link>
            ) : (
                <Text className="text-lg text-white font-bold">
                    You are too far to associate an audio
                </Text>
            )}
        </View>
    );
};

export default function POIDetailsPage({}) {
    const { poi, name, wikidata, wikipedia, latitude, longitude } =
        useLocalSearchParams<POIDetailsPageProps>();

    return (
        <PageContainer className="p-0 h-full" safe>
            <POIImage wikidata={wikidata} />
            <View className="absolute top-4 left-4 rounded-md bg-zinc-700 p-2">
                <Text className="text-lg text-white font-bold">{name}</Text>
            </View>
            <Animated.View
                layout={LinearTransition}
                className="flex flex-col gap-4"
            >
                <ScrollView className="flex flex-col h-full p-4 gap-4">
                    <View className="flex flex-col gap-4">
                        <AssociateAudioToPOIRedirect latitude={Number(latitude)} longitude={Number(longitude)} name={name}/>
                        <WikipediaDesc wikidata={wikidata} />
                        <View className="bg-zinc-800 flex flex-row rounded-md p-2">
                            <IconButton icon="map-marker" size={24} />
                            <View className="">
                                <Text className="text-lg text-green-600 font-bold">
                                    Coordinates
                                </Text>
                                <Text className="text-white">
                                    {latitude}, {longitude}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-green-600">
                                Associated Audios
                            </Text>
                            <Text className="text-white">
                                Empty! Be the first one to associate an audio!
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>
        </PageContainer>
    );
}
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    LinearTransition,
    useDerivedValue,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native";
import { Icon, IconButton } from "react-native-paper";
import { useLocation } from "@/utils/location/location";
import { haversineDistance } from "@/utils/map/routes";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const POIImage = ({ wikidata }: { wikidata: string }) => {
    const [imageURL, setImageURL] = useState<string>();
    const [status, setStatus] = useState<
        "init" | "url-obtained" | "loading" | "done"
    >("init");

    const [expandable, setExpandable] = useState<boolean>(false);

    const heightValue = useSharedValue("30%");

    const isExpanded = useDerivedValue(() => heightValue.value === "100%");

    const animatedStyle = useAnimatedStyle(() => ({
        //@ts-ignore
        height: heightValue.value,
    }));

    useEffect(() => {
        fetchWikidataImage(wikidata).then((url) => {
            console.log(url);
            setImageURL(url);
            setStatus("url-obtained");
        });
    }, [wikidata]);

    const handlePress = () => {
        heightValue.value = heightValue.value === "30%" ? "100%" : "30%";
    };

    if (status === "init") {
        return (
            <Animated.View
                style={[
                    { width: "100%", backgroundColor: "#27272a" },
                    animatedStyle,
                ]}
            />
        );
    }

    if (status === "url-obtained") {
        return (
            <Animated.View
                style={[
                    { width: "100%", backgroundColor: "#27272a" },
                    animatedStyle,
                ]}
                layout={LinearTransition}
            >
                <TouchableOpacity
                    onPress={imageURL && expandable ? handlePress : undefined}
                    activeOpacity={1}
                >
                    <AnimatedImage
                        source={{ uri: imageURL }}
                        style={{ width: "100%", height: "100%" }}
                        layout={LinearTransition}
                        onLoad={(e) => {
                            setExpandable(e.source.height > e.source.width);
                        }}
                        cachePolicy="memory"
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    }
};
