import { useCallback, useEffect, useState } from "react";
import { getUserBaseURI } from "../fs/fs";
import * as FS from "expo-file-system";

const userFile = "user.json";

const levels = [42, 100, 200, 400, 600, 800, 1000, 1500, 2000, 4000];

const MAX_LEVEL = levels.length;

export async function getLevelInfo() {
    const baseUri = await getUserBaseURI();
    const userUri = baseUri + "/" + userFile;

    const file = await FS.getInfoAsync(userUri);
    if (file.exists) {
        const content = await FS.readAsStringAsync(userUri);
        return JSON.parse(content);
    } else {
        FS.writeAsStringAsync(
            userUri,
            JSON.stringify({
                level: 1,
                exp: 0,
                nextLevel: levels[0],
                badges: [],
                nextBadge: 300,
            })
        );

        return {
            level: 1,
            exp: 0,
            nextLevel: 100,
            badges: [],
        };
    }
}

export async function updateLevelInfo(exp: number, badge?: string) {
    const baseUri = await getUserBaseURI();
    const userUri = baseUri + "/" + userFile;

    const file = await FS.getInfoAsync(userUri);
    if (file.exists) {
        const content = await FS.readAsStringAsync(userUri);
        const user = JSON.parse(content);
        user.exp += exp;

        if (user.exp >= user.nextLevel) {
            if (user.level >= MAX_LEVEL) {
                user.nextLevel = null;
            } else {
                user.level++;
                user.nextLevel = levels[user.level - 1];
            }
        }

        if (badge) {
            user.badges.push(badge);
        }

        await FS.writeAsStringAsync(userUri, JSON.stringify(user));
    }
}

export function useLevelInfo() {
    const [levelInfo, setLevelInfo] = useState(null);

    const update = useCallback(async () => {
        const info = await getLevelInfo();
        setLevelInfo(info);
    }, []);

    useEffect(() => {
        getLevelInfo().then((info) => setLevelInfo(info));
    }, []);

    return {
        levelInfo,
        update,
    };
}
