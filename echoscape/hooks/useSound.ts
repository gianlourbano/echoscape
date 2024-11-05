import { useState, useEffect } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { getUserBaseURI } from "@/utils/fs/fs";

import * as Notifications from "expo-notifications";

/*
hook to play an audio
output: function that, when called, plays the sound
the function returned takes one argument, which is the audio to play
when sound changes or when component unmounts unloads the audio, to prevent memory leaks
usage:
    const playSound = usePlaySound()
*/
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

    async function playSound(file: any) {
        console.log(`usePlaySound: Loading Sound (${file})`);
        const { sound } = await Audio.Sound.createAsync(
            file,
            { shouldPlay: true },
            onPlayBackStatusUpdate
        );
        setSound(sound);

        await sound.setStatusAsync({
             shouldPlay: true
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
        //sound.unloadAsync();
    }

    useEffect(() => {
        return sound
            ? () => {
                  console.log("usePlaySound: Unloading Sound");
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    return {
        playSound,
        pauseSound: sound?.pauseAsync || (() => {}),
        stopSound: sound?.stopAsync,
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
