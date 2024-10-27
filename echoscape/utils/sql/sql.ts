// utils/audioDB.ts
import * as SQLite from 'expo-sqlite';
import { ss_get } from "../secureStore/SStore";

const db = SQLite.openDatabaseSync("audios.db");


export interface AudioData {
    user: string;
    id: number;
    uri: string;
    uploaded: boolean;
    backendData: string | null;
}

export interface BackendAudioData {
    bpm: number;
    danceability: number;
    loudness: number;
    mood: Record<string, number>;
    genre: Record<string, number>;
    instrument: Record<string, number>;
}


export const getAudioData = async (): Promise<AudioData[]> => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const username = await ss_get("username");
    return db.getAllAsync<AudioData>(`SELECT * FROM audios WHERE user = ?`, [username]);
};

export const getToBeUploadedAudioData = async (): Promise<AudioData[]> => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const username = await ss_get("username");
    return db.getAllAsync<AudioData>(`SELECT * FROM audios WHERE user = ? AND uploaded = 0`, [username]);
};

export const getAlreadyUploadedAudioData = async (): Promise<AudioData[]> => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    try {
        const username = await ss_get("username");
        console.log(await db.getAllAsync<AudioData>(`SELECT * FROM audios WHERE user = ? AND uploaded = 1`, [username]))
        return await db.getAllAsync<AudioData>(`SELECT * FROM audios WHERE user = ? AND uploaded = 1`, [username]);
    } catch (error) {
        console.error("Error fetching already uploaded audio data:", error);
        return [];
    }
};

export const uploadAudioData = async (uri: string, backendData: string): Promise<void> => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const newUri = uri.replace("/tmp", "");
    await db.runAsync(`UPDATE audios SET uploaded = 1, backendData = ?, uri = ? WHERE uri = ?`, [backendData, newUri, uri]);
};

export const addAudioData = async (uri: string): Promise<void> => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const username = await ss_get("username");
    await db.runAsync(`INSERT INTO audios (user, uri, uploaded) VALUES (?, ?, 0)`, [username, uri]);
};

export const deleteAudioData = async (uri: string): Promise<void> => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    await db.runAsync(`DELETE FROM audios WHERE uri = ?`, [uri]);
};

export const deleteAllAudioData = async (): Promise<void> => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    await db.runAsync(`DELETE FROM audios`);
};

export const useAudioDB = () => {
    return {
        getAudioData,
        getToBeUploadedAudioData,
        getAlreadyUploadedAudioData,
        uploadAudioData,
        addAudioData,
        deleteAudioData,
        deleteAllAudioData,
    };
}