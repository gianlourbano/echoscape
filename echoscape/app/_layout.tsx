import { Slot, Stack } from "expo-router";

import "../global.css";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { AuthProvider } from "@/utils/auth/AuthProvider";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { NetworkProvider } from "@/utils/network/NetworkProvider";
import { SWRConfig } from "swr";


// assign this value to false if you want to disable all console.debug
if (true) {
    console.debug = () => {};
}


export default function RootLayout() {
    return (
        <SWRConfig>

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
