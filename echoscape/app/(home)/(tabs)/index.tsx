import { View, StyleSheet } from "react-native";
import Map from "@/components/Map/Map";
import { Link, useLocalSearchParams } from "expo-router";
import ClusteredMap from "@/components/Map/ClusteredMap"
import { useEffect } from "react";

export default function MapPage() {
    const {latitude, longitude} = useLocalSearchParams<{longitude?: string, latitude?: string}>();

    return (
        <View style={styles.container}>
            <Link href="/modal">Modal</Link>
            <ClusteredMap latitude={Number(latitude)} longitude={Number(longitude)}/>
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
