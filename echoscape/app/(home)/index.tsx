import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { useAuth } from "@/utils/auth/AuthProvider";
import { Button } from "react-native-paper";
import { invalidateToken, invalidateUser } from "@/utils/utils";

export default function Page() {
    const [isConnected, setIsConnected] = useState<boolean | null>(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);
            setIsConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const {status: authStatus, dispatch} = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.main}>
                <Image
                    source={require("../../assets/image.png")}
                    className="self-center"
                />
                <Text style={styles.title}>Map goes here</Text>
                <Text className="">
                    Connection status:{" "}
                    {isConnected ? "Connected!" : "Not connected :/"}
                </Text>
                <Text>{authStatus};</Text>
                <Link href="/second" style={styles.subtitle}>
                    Next
                </Link>

                <TokenTest />

                <Button onPress={async () => {
                    dispatch("logout");
                }}>Logout</Button> 

                <Button onPress={async () => {
                    //await invalidateUser();
                    await invalidateToken();
                }}>Invalidate things</Button>
            </View>
        </View>
    );
}

const TokenTest = () => {
    const { withAuthFetch } = useAuth();


    
    return (
        <View>
            <Button onPress={() => {
                withAuthFetch("http://130.136.2.83/audio/all", {}).then((res) => res?.json()).then((data) => console.log(data))
            }}>Test Token</Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 24,
    },
    main: {
        flex: 1,
        justifyContent: "center",
        maxWidth: 960,
        marginHorizontal: "auto",
    },
    title: {
        fontSize: 64,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 36,
        color: "#38434D",
    },
});
