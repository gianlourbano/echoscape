import { useAuth } from "@/utils/auth/AuthProvider";
import { ss_get, ss_save } from "@/utils/secureStore/SStore";
import { createStrictContext } from "@/utils/StrictContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo, refresh } from "@react-native-community/netinfo";
import { ScrollView } from "moti";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { Surface, Button, Text, Card } from "react-native-paper";

type DebugContext = {
    subscribe: (refresh: () => Promise<void>) => void;
    loading: boolean;
};

const [DebugProvider_, useDebug] = createStrictContext<DebugContext>(undefined);

const DebugProvider = ({ children }) => {
    const [subscribers, setSubscribers] = useState<(() => Promise<void>)[]>([]);

    const subscribe = useCallback((refresh: () => Promise<void>) => {
        setSubscribers([...subscribers, refresh]);
    }, []);

    const [loading, setLoading] = useState(false);

    return (
        <DebugProvider_ value={{ subscribe, loading }}>
            <Button
                onPress={() => {
                    console.log(`Refreshing ${subscribers.length} subscribers`);
                    setLoading(true);
                    Promise.all(subscribers.map((sub) => sub())).then(() =>
                        setLoading(false)
                    );
                }}
            >
                Refresh All
            </Button>
            {children}
        </DebugProvider_>
    );
};

export default function DebugPage() {
    return (
        <DebugProvider>
            <Surface>
                <ScrollView className="">
                    <Surface className="p-8 flex flex-col gap-2">
                        <AuthDebug />
                        <EncryptedStorageDebug />
                        <InternalStorageDebug />
                        <FileSystemDebug />
                        <SqlDebug />
                        <NetworkDebug />
                        <LocationDebug />
                        <SoundDebug />
                        <MapDebug />
                        <PlaceholderDebug />
                    </Surface>
                </ScrollView>
            </Surface>
        </DebugProvider>
    );
}

const DebugContainer = ({ children, title }) => {
    return (
        <Card className="flex flex-col gap-2 p-4 rounded-md">
            <Card.Title
                title={title}
                className="text-lg font-bold "
            ></Card.Title>
            <Card.Content>{children}</Card.Content>
        </Card>
    );
};

const AuthDebug = () => {
    const { dispatch, status, withAuthFetch } = useAuth();

    return (
        <DebugContainer title="Auth">
            <Text>Status: {status}</Text>
            <Button onPress={() => dispatch("refresh")}>Test refresh</Button>
            <Button
                onPress={() =>
                    withAuthFetch(`${process.env.BACKEND_BASE_URL}/audio/all`)
                }
            >
                Test fetch
            </Button>
            <Button onPress={() => dispatch('logout')}>Logout</Button>
        </DebugContainer>
    );
};

const EncryptedStorageDebug = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [lastUpdate, setLastUpdate] = useState("");

    const refresh = async () => {
        setUsername(await ss_get("username"));
        setPassword(await ss_get("password"));
        setToken(await ss_get("token"));
        setLastUpdate(await ss_get("lastUpdate"));
    };

    const { subscribe, loading } = useDebug();

    useEffect(() => {
        refresh();
        subscribe(refresh);
    }, []);

    return (
        <DebugContainer title="Encrypted Storage">
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                <>
                    <Text>Username: {username}</Text>
                    <Text>Password: {password}</Text>
                    <Text>Token {token ? "found" : "not found"}</Text>
                    <Text>Last Update: {lastUpdate}</Text>
                </>
            )}

            <Button
                onPress={async () => {
                    ss_save("token", "").then(() => refresh());
                }}
            >
                Invalidate token
            </Button>
        </DebugContainer>
    );
};

const InternalStorageDebug = () => {
    return (
        <DebugContainer title="Internal Storage">
            <Text>Not implemented</Text>
        </DebugContainer>
    );
};

const FileSystemDebug = () => {
    return (
        <DebugContainer title="File System">
            <Text>Not implemented</Text>
        </DebugContainer>
    );
};

const SqlDebug = () => {
    return (
        <DebugContainer title="SQLite">
            <Text>Not implemented</Text>
        </DebugContainer>
    );
};

const NetworkDebug = () => {
    const netInfo = useNetInfo();

    return (
        <DebugContainer title="Network">
            <Text>{JSON.stringify(netInfo, null, 2)}</Text>
            <Button onPress={() => refresh()}>Refresh</Button>
        </DebugContainer>
    );
};

const LocationDebug = () => {
    return (
        <DebugContainer title="Location">
            <Text>Not implemented</Text>
        </DebugContainer>
    );
};

const SoundDebug = () => {
    return (
        <DebugContainer title="Sound">
            <Text>Not implemented</Text>
        </DebugContainer>
    );
};

const MapDebug = () => {
    const [allKeys, setAllKeys] = useState<readonly string[]>([]);
    const [cacheData, setCacheData] = useState<{ [key: string]: any }>({});
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    async function eraseAudioCache() {
        allKeys.forEach((item, index) => {
            AsyncStorage.removeItem(item)
        })
    }

    useEffect(() => {
        AsyncStorage.getAllKeys((error: Error | null, result: readonly string[]) => {
            if (result) {
                setAllKeys(result);
            }
        });
    }, []);

    const toggleExpand = (key: string) => {
        setExpandedKeys((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    useEffect(() => {
        allKeys.forEach((key) => {
            AsyncStorage.getItem(key, (error, result) => {
                if (result) {
                    setCacheData((prevData) => ({
                        ...prevData,
                        [key]: result,
                    }));
                }
                if (error) {
                    console.error("Error while fetching cache in MapDebug: ", error)
                }
            });
        });
    }, [allKeys]);

    return (
        <DebugContainer title="Map">
            <Button onPress={eraseAudioCache}>Clear audio marker cache</Button>
            {allKeys.map((key) => (
                <View key={key} style={styles.dropdownContainer}>
                    <TouchableOpacity onPress={() => toggleExpand(key)}>
                        <Text style={styles.dropdownTitle}>{key}</Text>
                    </TouchableOpacity>
                    {expandedKeys.has(key) && (
                        <View style={styles.dropdownContent}>
                            <Text>{cacheData[key]}</Text>
                        </View>
                    )}
                </View>
            ))}
        </DebugContainer>
    );
};

const styles = StyleSheet.create({
    dropdownContainer: {
        marginBottom: 10,
    },
    dropdownTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        padding: 10,
        backgroundColor: '#000000',
        borderRadius: 5,
    },
    dropdownContent: {
        padding: 10,
        backgroundColor: '#0f0f0f',
        borderRadius: 5,
    },
});

const PlaceholderDebug = () => {
    return (
        <DebugContainer title="Fondo pagina">
            <Text>riempitivo</Text>
        </DebugContainer>
    )
}
