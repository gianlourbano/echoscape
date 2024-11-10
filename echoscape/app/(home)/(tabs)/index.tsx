import { View, StyleSheet } from "react-native";
import Map from "@/components/Map/Map";
import { Link, useLocalSearchParams } from "expo-router";
import ClusteredMap from "@/components/Map/ClusteredMap";
import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";

export default function MapPage() {
    const { latitude, longitude } = useLocalSearchParams<{
        longitude?: string;
        latitude?: string;
    }>();

    const [selectedGenre, setSelectedGenre] = useState();
    const genres = [
        "any",
        "60s",
        "70s",
        "80s",
        "90s",
        "acidjazz",
        "alternative",
        "alternativerock",
        "ambient",
        "atmospheric",
        "blues",
        "bluesrock",
        "bossanova",
        "breakbeat",
        "celtic",
        "chanson",
        "chillout",
        "choir",
        "classical",
        "classicrock",
        "club",
        "contemporary",
        "country",
        "dance",
        "darkambient",
        "darkwave",
        "deephouse",
        "disco",
        "downtempo",
        "drumnbass",
        "dub",
        "dubstep",
        "easylistening",
        "edm",
        "electronic",
        "electronica",
        "electropop",
        "ethno",
        "eurodance",
        "experimental",
        "folk",
        "funk",
        "fusion",
        "groove",
        "grunge",
        "hard",
        "hardrock",
        "hiphop",
        "house",
        "idm",
        "improvisation",
        "indie",
        "industrial",
        "instrumentalpop",
        "instrumentalrock",
        "jazz",
        "jazzfusion",
        "latin",
        "lounge",
        "medieval",
        "metal",
        "minimal",
        "newage",
        "newwave",
        "orchestral",
        "pop",
        "popfolk",
        "poprock",
        "postrock",
        "progressive",
        "psychedelic",
        "punkrock",
        "rap",
        "reggae",
        "rnb",
        "rock",
        "rocknroll",
        "singersongwriter",
        "soul",
        "soundtrack",
        "swing",
        "symphonic",
        "synthpop",
        "techno",
        "trance",
        "triphop",
        "world",
        "worldfusion",
    ];

    return (
        <View style={styles.container}>
            <Link href="/modal">Modal</Link>
            <ClusteredMap
                latitude={Number(latitude)}
                longitude={Number(longitude)}
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedGenre}
                    onValueChange={(itemValue, itemIndex) =>
                        setSelectedGenre(itemValue)
                    }
                    style={styles.picker}
                >
                    {genres.map((genre) => (
                        <Picker.Item key={genre} label={genre} value={genre} />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    pickerContainer: {
        position: "absolute",
        bottom: 20,
        left: 20,
        width: "30%",
        backgroundColor: "#fff",
        borderRadius: 5,
        alignSelf: "center",
    },
    picker: {
        height: 50,
        color: "#000",
    },
});
