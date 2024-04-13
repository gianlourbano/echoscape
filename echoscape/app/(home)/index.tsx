import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from "react";

export default function Page() {

    const [isConnected, setIsConnected] = useState<boolean | null>(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);
            setIsConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        }
    
    }, [])

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text className="">{isConnected ? "Connected!" : "Not connected :/"}</Text>
        <Link href="/second" style={styles.subtitle}>
          Next
        </Link>
      </View>
    </View>
  );
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