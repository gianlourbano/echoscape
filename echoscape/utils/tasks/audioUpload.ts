import { useNetInfo } from "@react-native-community/netinfo";
import { useAudioDB } from "../sql/sql";
import * as FileSystem from "expo-file-system";


/*
saves information about the audio in the local database
if internet is available, uploads the audio too

loadRecordings is a function that can be passed when uploadAudio is used in a react component,
and can be left undefined when used elsewhere
*/
export const uploadAudio = async (uri: string, loadRecordings?: () => void) => {
    const { addAudioData, uploadAudioData, getAudioData, deleteAllAudioData } = useAudioDB();
    const netInfo = useNetInfo();
    if (netInfo.isConnected && netInfo.isInternetReachable) {
        console.log("[AUDIO UP] Audio can be uploaded!");

        // fetch... 

        await addAudioData(uri).then(async () => {
            const r = await getAudioData();
            console.log(r);
        });

        const backendData = {}
    
        await uploadAudioData(uri, JSON.stringify(backendData)).then(async () => {
            const r = await getAudioData();
            console.log(r);
        });

        await FileSystem.moveAsync({
            from: uri,
            to: uri.replace("/tmp", ""),
        });

        console.log("[AUDIO UP] Audio uploaded!");

        if (loadRecordings) loadRecordings();

    } else {
        console.log(
            "[AUDIO UP] No internet connection. Scheduled for later."
        );

        await addAudioData(uri).then(async () => {
            const r = await getAudioData();
            console.log(r);
        });
    }
};