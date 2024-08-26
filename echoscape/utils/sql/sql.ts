import { useSQLiteContext } from "expo-sqlite";
import { ss_get } from "../secureStore/SStore";


export interface AudioData {
    user: string;
    id: number;
    uri: string;
    uploaded: boolean;
    backendData: string | null;
}

export function useAudioDB() {
    const db = useSQLiteContext();

    const getAudioData = async () => {
        const username = await ss_get("username");
        const result = await db.getAllAsync(
            `SELECT * FROM audios WHERE user = ?`,
            [username]
        );
        return result as AudioData[];
    };

    const getToBeUploadedAudioData = async () => {
        const username = await ss_get("username");

        const result = await db.getAllAsync(
            `SELECT * FROM audios WHERE user = ? AND uploaded = 0`,
            [username]
        );
        return result as AudioData[];
    };

    const uploadAudioData = async (uri: string, backendData: string) => {
        const newUri = uri.replace("/tmp", "");
        await db.runAsync(`UPDATE audios SET uploaded = 1, backendData = ?, uri = ? WHERE uri = ?`, [backendData, newUri, uri]);
        
    };

    const addAudioData = async (uri: string) => {
        const username = await ss_get("username");

        await db.runAsync(
            `INSERT INTO audios (user, uri, uploaded) VALUES (?, ?, 0)`,
            [username, uri]
        );
    };

    const deleteAudioData = async (uri: string) => {
        await db.runAsync(`DELETE FROM audios WHERE uri = ?`, [uri]);
    }

    const deleteAllAudioData = async () => {
        await db.runAsync(`DELETE FROM audios`);
    }

    return {
        getAudioData,
        getToBeUploadedAudioData,
        uploadAudioData,
        addAudioData,
        deleteAllAudioData,
        deleteAudioData,
    };
}
