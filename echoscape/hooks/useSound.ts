import { useState, useEffect } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";

import * as Notifications from "expo-notifications";

export function usePlaySound(
    onPlayBackStatusUpdate?: (status: AVPlaybackStatus) => void
) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [duration, setDuration] = useState<number | null>(null);

    async function playSound(file: any) {
        if(sound) {
            const status = await sound.getStatusAsync();
            if(status.positionMillis === status.durationMillis) {
                await sound.setStatusAsync({
                    positionMillis: 0,
                    shouldPlay: true,
                })
                return;
            } else {
                await sound.setStatusAsync({shouldPlay: true})
            }
            console.log(status);
            
            return;
        }

        console.log(`usePlaySound: Loading Sound (${file})`);
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });
        const { sound: s } = await Audio.Sound.createAsync(
            file,
            { shouldPlay: true },
            onPlayBackStatusUpdate
        );
        setSound(s);

        const status = await s.getStatusAsync();
        setDuration(status.durationMillis);

        await s.setStatusAsync({
            shouldPlay: true,

        });

        console.log("usePlaySound: Playing Sound");
        //await sound.playAsync();
        Notifications.scheduleNotificationAsync({
            content: {
                title: "🎵",
                body: "Playing sound",
            },
            trigger: null,
        });

        //unloads sound right after playing it
        //s.unloadAsync();
    }

    useEffect(() => {
        console.log("THIS MF");
        return sound
            ? () => {
                  console.log("usePlaySound: Unloading Sound");
                  sound.unloadAsync();
              }
            : undefined;
    }, []);

    return {
        playSound,
        sound: sound,
        duration,
    };
}

/*
considerazioni: file è di tipo any perchè non so bene che tipo siano i file
*/

/*
hook to record audios from device
output: object with two functions inside:
    the first one starts to record
    the second one stops it, saves it in device's filesystem, and returns the uri to the saved file
usage:
    const { startRecording, stopRecording } = useRecordSound()
*/
export function useRecordSound() {
    const [recording, setRecording] = useState<Audio.Recording | undefined>();

    async function startRecording() {
        try {
            console.log("useRecordSound: Requesting permission..");
            const permissionResponse = await Audio.requestPermissionsAsync();
            if (!permissionResponse.granted) {
                throw new Error("Permission not granted");
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log("useRecordSound: Starting recording..");
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log("useRecordSound: Recording started");
        } catch (err) {
            console.error("useRecordSound: Failed to start recording", err);
        }
    }

    async function stopRecording() {
        console.log("useRecordSound: Stopping recording..");
        if (!recording) {
            console.error("useRecordSound: No recording to stop");
            return;
        }

        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });

        const uri = recording.getURI();
        console.log("useRecordSound: Recording stopped and stored at", uri);

        // const dir = await getUserBaseURI();

        // await FileSystem.copyAsync({
        //     from: uri,
        //     to: dir + `/recording-${Date.now()}.wav`,
        // });

        return uri;
    }

    return { startRecording, stopRecording };
}
