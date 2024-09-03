import { View, StyleSheet } from "react-native";
import MapComponent from "@/components/Map/Map";
import { Link, useLocalSearchParams } from "expo-router";

export default function MapPage() {
    const {latitude, longitude} = useLocalSearchParams<{longitude?: string, latitude?: string}>();
    //console.log(latitude, longitude);

    return (
        <View style={styles.container}>
            <Link href="/modal">Modal</Link>
            <MapComponent initialLatitude={latitude} initialLongitude={longitude}/>
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
});
