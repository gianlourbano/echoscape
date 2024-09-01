import { View, StyleSheet } from "react-native";
import MapComponent from "@/components/Map/Map";

export default function MapPage() {
    return (
        <View style={styles.container}>
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
