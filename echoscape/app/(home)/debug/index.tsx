import { useAuth } from "@/utils/auth/AuthProvider";
import { ss_get, ss_save } from "@/utils/secureStore/SStore";
import { createStrictContext } from "@/utils/StrictContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo, refresh } from "@react-native-community/netinfo";
import { ScrollView } from "moti";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, TextInput } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { Surface, Button, Text, Card } from "react-native-paper";
import * as TaskManager from 'expo-task-manager';
import { sendNotification } from "@/utils/notifications/manageNotifications";
import { AudioData, getToBeUploadedAudioData, getAlreadyUploadedAudioData } from "@/utils/sql/sql";
import { simpleDebounce } from "@/utils/utils";
import Collapsible from 'react-native-collapsible';
import { createOverpassPathQuery, fetchOverpass } from "@/utils/overpass/request";
import { matchPOIsToNodes } from "@/utils/map/routes";


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
                        <TaskManagerDebug />
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
    const [isVisible, setIsVisible] = useState<boolean>(true); // State per gestire la visibilità globale

    async function eraseAudioCache() {
        allKeys.forEach((item, index) => {
            AsyncStorage.removeItem(item);
        });
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
                    console.error("Error while fetching cache in MapDebug: ", error);
                }
            });
        });
    }, [allKeys]);


    const [num1, setNum1] = useState('');
    const [num2, setNum2] = useState('');
    const [num3, setNum3] = useState('');
    const [num4, setNum4] = useState('');

    const handleButtonPress = () => {
        const number1 = parseFloat(num1);
        const number2 = parseFloat(num2);
        const number3 = parseFloat(num3);
        const number4 = parseFloat(num4);

        if (isNaN(number1) || isNaN(number2) || isNaN(number3) || isNaN(number4)) {
            //Alert.alert('Errore', 'Per favore inserisci solo numeri.');
            return;
        }

        fetchRoute(number1, number2, number3, number4);
    };


    const fetchRoute = async (startLat, startLng, endLat, endLng) => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_OSRM_API_URL}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
            const routeCoords = data.routes[0].geometry.coordinates.map(
                (point) => ({
                    latitude: point[1],
                    longitude: point[0],
                })
            );
            //setRouteCoordinates(routeCoords);
        } catch (error) {
            console.error(error);
        }
    };


    async function tryOverpassRequest() {
        const path = [
            [
              11.357461,
              44.490027
            ],
            [
              11.357474,
              44.489907
            ],
            [
              11.357571,
              44.489909
            ],
            [
              11.357683,
              44.489909
            ],
            [
              11.357658,
              44.4902
            ],
            [
              11.357654,
              44.490246
            ],
            [
              11.357644,
              44.490328
            ],
            [
              11.357595,
              44.490744
            ],
            [
              11.357582,
              44.490859
            ],
            [
              11.357555,
              44.49109
            ],
            [
              11.357542,
              44.491196
            ],
            [
              11.357539,
              44.491219
            ],
            [
              11.357406,
              44.492339
            ],
            [
              11.357405,
              44.492365
            ],
            [
              11.357397,
              44.492446
            ],
            [
              11.357396,
              44.492457
            ],
            [
              11.357394,
              44.492474
            ],
            [
              11.357338,
              44.492992
            ],
            [
              11.357233,
              44.493855
            ],
            [
              11.357212,
              44.494003
            ],
            [
              11.357204,
              44.494075
            ],
            [
              11.357202,
              44.494097
            ],
            [
              11.357194,
              44.494178
            ],
            [
              11.357192,
              44.494201
            ],
            [
              11.357162,
              44.494472
            ],
            [
              11.357118,
              44.494844
            ],
            [
              11.35706,
              44.495326
            ],
            [
              11.35699,
              44.495945
            ],
            [
              11.356927,
              44.496499
            ],
            [
              11.356925,
              44.496517
            ],
            [
              11.35692,
              44.496565
            ],
            [
              11.356749,
              44.498097
            ],
            [
              11.356737,
              44.4982
            ],
            [
              11.356703,
              44.498479
            ],
            [
              11.356693,
              44.498563
            ],
            [
              11.356678,
              44.498641
            ],
            [
              11.356662,
              44.498706
            ],
            [
              11.356637,
              44.498813
            ],
            [
              11.356616,
              44.498943
            ],
            [
              11.356596,
              44.49913
            ],
            [
              11.356565,
              44.49943
            ],
            [
              11.356381,
              44.500887
            ],
            [
              11.356372,
              44.500913
            ],
            [
              11.356363,
              44.500941
            ],
            [
              11.356328,
              44.500986
            ],
            [
              11.356276,
              44.501028
            ],
            [
              11.356189,
              44.50106
            ],
            [
              11.355545,
              44.501311
            ],
            [
              11.355054,
              44.50149
            ],
            [
              11.354926,
              44.501536
            ],
            [
              11.35477,
              44.501593
            ],
            [
              11.354552,
              44.501672
            ],
            [
              11.353377,
              44.502101
            ],
            [
              11.352775,
              44.50232
            ],
            [
              11.352586,
              44.502407
            ],
            [
              11.351315,
              44.502924
            ],
            [
              11.351121,
              44.503005
            ],
            [
              11.350956,
              44.503073
            ],
            [
              11.350756,
              44.503154
            ],
            [
              11.350665,
              44.503191
            ],
            [
              11.34992,
              44.503493
            ],
            [
              11.34961,
              44.503619
            ],
            [
              11.349448,
              44.503687
            ],
            [
              11.349217,
              44.503779
            ],
            [
              11.349197,
              44.503787
            ],
            [
              11.348828,
              44.503945
            ],
            [
              11.34828,
              44.504163
            ],
            [
              11.348011,
              44.504237
            ],
            [
              11.347546,
              44.504344
            ],
            [
              11.347209,
              44.504427
            ],
            [
              11.347073,
              44.50446
            ],
            [
              11.346319,
              44.504642
            ],
            [
              11.345785,
              44.504764
            ],
            [
              11.34549,
              44.504824
            ],
            [
              11.345161,
              44.504875
            ],
            [
              11.34453,
              44.504971
            ],
            [
              11.344439,
              44.504985
            ],
            [
              11.344367,
              44.504996
            ],
            [
              11.343884,
              44.505073
            ],
            [
              11.343802,
              44.505087
            ],
            [
              11.343673,
              44.505107
            ],
            [
              11.343538,
              44.505129
            ],
            [
              11.343406,
              44.50515
            ],
            [
              11.343173,
              44.505188
            ],
            [
              11.342937,
              44.505226
            ],
            [
              11.342888,
              44.505234
            ],
            [
              11.342803,
              44.505248
            ],
            [
              11.342647,
              44.505272
            ],
            [
              11.342405,
              44.505313
            ],
            [
              11.342277,
              44.505355
            ],
            [
              11.341639,
              44.505451
            ],
            [
              11.3413,
              44.505479
            ],
            [
              11.341022,
              44.505524
            ],
            [
              11.339853,
              44.505718
            ],
            [
              11.339718,
              44.505728
            ],
            [
              11.339625,
              44.505726
            ],
            [
              11.339565,
              44.50572
            ],
            [
              11.339473,
              44.505711
            ],
            [
              11.339341,
              44.50568
            ],
            [
              11.339243,
              44.505649
            ],
            [
              11.339162,
              44.505617
            ],
            [
              11.33842,
              44.505251
            ],
            [
              11.338334,
              44.50521
            ],
            [
              11.338313,
              44.5052
            ],
            [
              11.338251,
              44.505169
            ],
            [
              11.337886,
              44.504989
            ],
            [
              11.337692,
              44.504896
            ],
            [
              11.337504,
              44.504805
            ],
            [
              11.337477,
              44.504789
            ],
            [
              11.336559,
              44.504311
            ],
            [
              11.336226,
              44.50414
            ],
            [
              11.335831,
              44.503939
            ],
            [
              11.334947,
              44.503498
            ],
            [
              11.334899,
              44.503471
            ],
            [
              11.334771,
              44.503405
            ],
            [
              11.334512,
              44.503276
            ],
            [
              11.334468,
              44.503256
            ],
            [
              11.334351,
              44.503196
            ],
            [
              11.333753,
              44.502892
            ],
            [
              11.333501,
              44.502763
            ],
            [
              11.333433,
              44.50273
            ],
            [
              11.333344,
              44.502691
            ],
            [
              11.333176,
              44.502619
            ],
            [
              11.333102,
              44.502595
            ],
            [
              11.333039,
              44.502558
            ],
            [
              11.332991,
              44.50251
            ],
            [
              11.332959,
              44.502446
            ],
            [
              11.332952,
              44.502401
            ],
            [
              11.332959,
              44.502356
            ],
            [
              11.332978,
              44.502313
            ],
            [
              11.332998,
              44.502285
            ],
            [
              11.333014,
              44.502267
            ],
            [
              11.333049,
              44.502238
            ],
            [
              11.333099,
              44.502209
            ],
            [
              11.333156,
              44.502189
            ],
            [
              11.333217,
              44.502176
            ],
            [
              11.333248,
              44.502173
            ],
            [
              11.333279,
              44.502173
            ],
            [
              11.33331,
              44.502174
            ],
            [
              11.333341,
              44.502178
            ],
            [
              11.333371,
              44.502184
            ],
            [
              11.3334,
              44.502193
            ]
          ]
        const result = await fetchOverpass(createOverpassPathQuery(path, 300))
        console.log("overpass response: ", result)

        const processedDataPOI = result.elements.map((element) => ({latitude: element.lat, longitude: element.lon}))
        const processedDataPath = result.elements.map((element) => ({latitude: element.lat, longitude: element.lon}))

        const matchedPOIs = matchPOIsToNodes(processedDataPOI, processedDataPath, 300)
        console.log("matchedPOIs: ", matchedPOIs)
    }


    // Funzione per gestire la visibilità di tutti gli elementi
    const toggleVisibility = () => {
        setIsVisible((prev) => !prev);
    };

    return (
        <DebugContainer title="Map">
            <TextInput
                placeholderTextColor={'gray'}
                placeholder="startLat"
                keyboardType="numeric"
                value={num1}
                onChangeText={setNum1}
            />
            <TextInput
                placeholderTextColor={'gray'}
                placeholder="startLng"
                keyboardType="numeric"
                value={num2}
                onChangeText={setNum2}
            />
            <TextInput
                placeholderTextColor={'gray'}
                placeholder="endLat"
                keyboardType="numeric"
                value={num3}
                onChangeText={setNum3}
            />
            <TextInput
                placeholderTextColor={'gray'}
                placeholder="endLng"
                keyboardType="numeric"
                value={num4}
                onChangeText={setNum4}
            />
            <Button onPress={handleButtonPress}>trova percorso da Start a End</Button>
            
            <Button onPress={eraseAudioCache}>Clear audio marker cache</Button>
            <Button onPress={tryOverpassRequest}>
                stampa risposta richiesta overpass e matched POIs
            </Button>
            <Button onPress={toggleVisibility}>
                {isVisible ? 'Hide All audio cache' : 'Show All audio cache'}
            </Button>
            {isVisible && (
                <>
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
                </>
            )}
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


const TaskManagerDebug = () => {
    async function printToBeUploadedAudios() {
        const toBeUploadedAudios: AudioData[] = await getToBeUploadedAudioData()
        console.log("toBeUploadedAudios: ", toBeUploadedAudios)
    }

    async function printAlreadyUploadedAudios() {
      const alreadyUploadedAudios: AudioData[] = await getAlreadyUploadedAudioData()
      console.log("alreadyUploadedAudios: ", alreadyUploadedAudios)
  }

    const debounceTest = simpleDebounce(() => {
        console.log("funzione debounce test eseguita");
    }, 3000);
    return (
        <DebugContainer title="Sound">
            <Button 
                onPress={async() => {console.log("TaskManager.getRegisteredTasksAsync(): ", await TaskManager.getRegisteredTasksAsync())}}
            >
                print registered tasks
            </Button>
            <Button
                onPress={() => {
                    sendNotification({title: "titolo", body: "body"})
                }}
            >
                send notification
            </Button>
            <Button
                onPress={printToBeUploadedAudios}
            >
                print audios not yet uploaded
            </Button>
            <Button
                onPress={printAlreadyUploadedAudios}
            >
                print audios already uploaded
            </Button>
            <Button
                onPress={debounceTest}
            >
                debounce function
            </Button>
        </DebugContainer>
    );
};



const PlaceholderDebug = () => {
    return (
        <DebugContainer title="Fondo pagina">
            <Text>riempitivo</Text>
        </DebugContainer>
    )
}
