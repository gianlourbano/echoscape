import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import NetInfo from '@react-native-community/netinfo';
import { sendNotification } from '../notifications/manageNotifications';
import { AudioData, useAudioDB } from '../sql/sql';
import { uploadAudio } from './audioUpload';


const TEST_TASK = 'TEST_TASK'
const NETWORK_CHECK_TASK = 'NETWORK_CHECK_TASK'


export async function defineTestTask() {
    TaskManager.defineTask(TEST_TASK, async () => {
        try {
            // Esegui il tuo codice di background fetch qui
            const state = await NetInfo.fetch();
            console.log(`---TEST task executed at ${new Date().toLocaleString()}--- network state: ${state}`);
            sendNotification({title: "test task", body: `---TEST task executed at ${new Date().toLocaleString()}--- network state: ${state.isConnected}`})
            return true;
        } catch (error) {
            console.error("error in test task execution: ", error);
            return false;
        }
    });
    console.log("test task defined")
}

export async function registerTestTask() {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        console.log('Background fetch is disabled');
        return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(TEST_TASK);
     if (isRegistered) console.log("test task already registered")
    if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(TEST_TASK, {
            minimumInterval: 10, 
            stopOnTerminate: false,
            startOnBoot: true,
        });
        console.log('Background fetch task registered');
    }
}

export async function unregisterTestTask() {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TEST_TASK);
    if (isRegistered) {
        await TaskManager.unregisterTaskAsync(TEST_TASK);
        console.log('TEST_TASK unregistered');
    } else {
        console.log('TEST_TASK is not registered');
    }
}


export async function defineNetworkCheckTask() {   
    TaskManager.defineTask(NETWORK_CHECK_TASK, async () => {
        try {
            const { getToBeUploadedAudioData } = useAudioDB();
            const toBeUploadedAudios: AudioData[] = await getToBeUploadedAudioData()
            const networkState = await NetInfo.fetch();
            if (networkState.isConnected && 
                networkState.isInternetReachable && 
                toBeUploadedAudios.length != 0) 
            {
                console.log('[Network check background task] Device reconnected to the internet');
                sendNotification({title: "network check task", body: "connection restored!"})
                // upload scheduled audios
                toBeUploadedAudios.forEach((item) => {
                    console.log(`attempting to upload ${item.uri}...`)
                    uploadAudio(item.uri)
                })
            }
            return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
            console.error(error);
            return BackgroundFetch.BackgroundFetchResult.Failed;
        }
    });
    console.log('Network check task defined')
}
    
export async function registerNetworkCheckTask() {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        console.log('Background fetch is disabled');
        return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(NETWORK_CHECK_TASK);
    if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(NETWORK_CHECK_TASK, {
            minimumInterval: 15, // repeats every 15 seconds
            stopOnTerminate: false,
            startOnBoot: true,
        });
        console.log('Network check task registered');
    }
    else {
        console.log('Network check task already registered')
    }
}

export async function unregisterNetworkCheckTask() {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(NETWORK_CHECK_TASK);
    if (isRegistered) {
        await TaskManager.unregisterTaskAsync(NETWORK_CHECK_TASK);
        console.log('NETWORK_CHECK_TASK unregistered');
    } else {
        console.log('NETWORK_CHECK_TASK is not registered');
    }
}