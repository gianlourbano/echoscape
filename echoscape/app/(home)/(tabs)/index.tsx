import { View, StyleSheet } from "react-native";
import Map from "@/components/Map/Map";
import { Link, useLocalSearchParams } from "expo-router";
import ClusteredMap from "@/components/Map/ClusteredMap"
import { useEffect } from "react";

export default function MapPage() {
    const {latitude, longitude} = useLocalSearchParams<{longitude?: string, latitude?: string}>();

    useEffect(() => {
        console.log("DEBUG map page component mounted")

    }, [])

    return (
        <View style={styles.container}>
            <Link href="/modal">Modal</Link>
            <ClusteredMap initialLatitude={latitude} initialLongitude={longitude}/>
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
