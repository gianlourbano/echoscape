import { Slot } from "expo-router";

import "../global.css";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/utils/auth/AuthProvider";
import {
    SQLiteProvider,
    type SQLiteDatabase,
} from "expo-sqlite";
import { NetworkProvider } from "@/utils/network/NetworkProvider";

export default function RootLayout() {
    return (
        <SQLiteProvider databaseName="audios.db" onInit={migrateDbIfNeeded}>
            <NetworkProvider>
                <AuthProvider>
                    <PaperProvider>
                        <Slot />
                    </PaperProvider>
                </AuthProvider>
            </NetworkProvider>
        </SQLiteProvider>
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
        // await db.runAsync(
        //     "INSERT INTO todos (value, intValue) VALUES (?, ?)",
        //     "hello",
        //     1
        // );
        // await db.runAsync(
        //     "INSERT INTO todos (value, intValue) VALUES (?, ?)",
        //     "world",
        //     2
        // );
        currentDbVersion = 1;
    }
    // if (currentDbVersion === 1) {
    //   Add more migrations
    // }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
