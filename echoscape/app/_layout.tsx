import { Slot, Stack } from "expo-router";

import "../global.css";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { AuthProvider } from "@/utils/auth/AuthProvider";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { NetworkProvider } from "@/utils/network/NetworkProvider";
import { SWRConfig } from "swr";
import { AppState } from "react-native";

// assign this value to true if you want to disable all console.debug
if (false) {
    console.debug = () => {};
}

export default function RootLayout() {
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
    const DATABASE_VERSION = 1;
    let { user_version: currentDbVersion } = await db.getFirstAsync<{
        user_version: number;
    }>("PRAGMA user_version");
    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }
    if (currentDbVersion === 0) {
        await db.execAsync(`
  PRAGMA journal_mode = 'wal';
  CREATE TABLE audios (id INTEGER PRIMARY KEY NOT NULL, user TEXT NOT NULL, uri TEXT NOT NULL, uploaded BOOLEAN NOT NULL DEFAULT 0, backendData TEXT);
  `);
        currentDbVersion = 1;
    }
    // if (currentDbVersion === 1) {
    //   Add more migrations
    // }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
