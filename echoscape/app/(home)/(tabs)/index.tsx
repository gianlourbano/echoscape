import { View, StyleSheet } from "react-native";
import MapComponent from "@/components/Map/Map";
import { Link } from "expo-router";

export default function MapPage() {
    return (
        <View style={styles.container}>
            <Link href="/modal">Modal</Link>
            <MapComponent />
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
