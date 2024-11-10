import NetInfo from "@react-native-community/netinfo";
import {
    addAudioData,
    uploadAudioData,
    getAudioData,
    deleteAllAudioData,
} from "../sql/sql";
import * as FileSystem from "expo-file-system";

import { updateLevelInfo } from "../level/level";
import * as Location from "expo-location";
import { getToken } from "../auth/AuthProvider";
import { ss_get } from "../secureStore/SStore";

/*
saves information about the audio in the local database
if internet is available, uploads the audio too

loadRecordings is a function that can be passed when uploadAudio is used in a react component,
and can be left undefined when used elsewhere
*/
export const uploadAudio = async (uri: string, loadRecordings?: () => void) => {
    const netinfodata = await NetInfo.fetch();
    if (netinfodata.isConnected && netinfodata.isInternetReachable) {
        const form = new FormData();
        // @ts-ignore
        form.append("file", {
            uri: uri,
            name: "audio.m4a",
            type: "audio/*",
        });

        const loc = await Location.getCurrentPositionAsync();

        const username = await ss_get("username");
        const password = await ss_get("password");

        const token = await getToken({
            username: username,
            password: password,
        });

        const response = await fetch(
            `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/upload?longitude=${loc.coords.longitude}&latitude=${loc.coords.latitude}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            }
        );

        if (!response.ok) {
            console.error("Error uploading audio:", await response.json());
            return;
        }

        const data = await response.json();
        const allaudios = await (
            await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/my`,
                {
                    headers: {
                        Authorization: `Bearer
                                    ${token}`,
                    },
                }
            )
        ).json();

        // search for the audio we just uploaded

        console.log(allaudios);
        console.log(data);

        // refetch every fucking single audio

        const audio_data_all = await Promise.all(
            (
                await Promise.all(
                    allaudios.map((audio) => {
                        return fetch(
                            `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/audio/${audio.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                    })
                )
            ).map((res) => res.json())
        );

        // now try and match loudness, bpm and danceability

        const final_backend_id = audio_data_all.find((audio) => {
            return (
                audio.tags.bpm === data.bpm &&
                audio.tags.loudness === data.loudness &&
                audio.tags.danceability === data.danceability
            );
        })?.id;

        console.log(final_backend_id);

        await uploadAudioData(uri, JSON.stringify(data), final_backend_id);

        await FileSystem.moveAsync({
            from: uri,
            to: uri.replace("/tmp", ""),
        });

        console.log("[AUDIO UP] Audio uploaded!");

        await updateLevelInfo(20);

        return true
    } else {
        return false
    }
};
