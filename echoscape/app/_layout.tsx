import { Slot, Stack } from "expo-router";

import "../global.css";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { AuthProvider } from "@/utils/auth/AuthProvider";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { NetworkProvider } from "@/utils/network/NetworkProvider";
import { SWRConfig } from "swr";
import { useEffect } from "react";
import * as TaskManager from "expo-task-manager";
import { AppState } from "react-native";
import { setNotificationHandler } from "expo-notifications";
import {
    sendNotification,
    setNotificationsHandler,
} from "@/utils/notifications/manageNotifications";
import NetInfo from "@react-native-community/netinfo";
import { AudioData, getToBeUploadedAudioData } from "@/utils/sql/sql";
import { uploadAudio } from "@/utils/tasks/audioUpload";
import { simpleDebounce } from "@/utils/utils";

import { SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

// assign this value to true if you want to disable all console.debug
if (false) {
    console.debug = () => {};
}

export default function RootLayout() {
    useEffect(() => {
        // notifications
        setNotificationsHandler();

        //debug
        AppState.addEventListener("change", () => {
            console.log("app state changed! : ", AppState.currentState);
        });

        /*
        upload audios when eventually connection is available
        */
        NetInfo.addEventListener(
            simpleDebounce(async (state) => {
                console.log(
                    `[network listener] state.type: ${state.type}, state.isConnected: ${state.isConnected} `
                );

                sendNotification({
                    title: "netInfo event listener",
                    body: `connection type ${state.type}, is connected ${state.isConnected}`,
                });
                if (state.isConnected) {
                    sendNotification({
                        title: "uploading audios",
                        body: "unified notification for audio upload",
                    });
                    const toBeUploadedAudios: AudioData[] =
                        await getToBeUploadedAudioData();

                    console.log(
                        `[network listener] toBeUploadedAudios (length ${toBeUploadedAudios.length}) ${toBeUploadedAudios}`
                    );

                    toBeUploadedAudios.forEach((item) => {
                        console.log(`attempting to upload ${item.uri}...`);
                        uploadAudio(item.uri);
                    });
                }
            }, 5000)
        );

        console.log("root layout mounted");
    }, []);

    return (
        <SWRConfig
            value={{
                provider: () => new Map(),
                isVisible: () => {
                    return true;
                },
                initFocus(callback) {
                    let appState = AppState.currentState;

                    const onAppStateChange = (nextAppState) => {
                        /* If it's resuming from background or inactive mode to active one */
                        if (
                            appState.match(/inactive|background/) &&
                            nextAppState === "active"
                        ) {
                            callback();
                        }
                        appState = nextAppState;
                    };

                    // Subscribe to the app state change events
                    const subscription = AppState.addEventListener(
                        "change",
                        onAppStateChange
                    );

                    return () => {
                        subscription.remove();
                    };
                },
            }}
        >
            <SQLiteProvider databaseName="audios.db" onInit={migrateDbIfNeeded}>
                <NetworkProvider>
                    <AuthProvider>
                        <PaperProvider>
                            <Slot />
                        </PaperProvider>
                    </AuthProvider>
                </NetworkProvider>
            </SQLiteProvider>
        </SWRConfig>
    );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 2;
    let { user_version: currentDbVersion } = await db.getFirstAsync<{
        user_version: number;
    }>("PRAGMA user_version");
    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }
    if (currentDbVersion === 0) {
        await db.execAsync(`
  PRAGMA journal_mode = 'wal';
  CREATE TABLE audios (id INTEGER PRIMARY KEY NOT NULL, user TEXT NOT NULL, uri TEXT NOT NULL, uploaded BOOLEAN NOT NULL DEFAULT 0, backendData TEXT, backend_id NUMBER DEFAULT NULL);
  `);
        currentDbVersion = 1;
    }
    if (currentDbVersion === 1) {
        await db.execAsync(`
            PRAGMA journal_mode = 'wal';
            ALTER TABLE audios ADD COLUMN backend_id NUMBER DEFAULT NULL;
            `);
        currentDbVersion = 2;
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
