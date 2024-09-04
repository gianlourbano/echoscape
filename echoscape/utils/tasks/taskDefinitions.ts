import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';


export async function defineBackgroundFetchTask() {
    TaskManager.defineTask('BACKGROUND_FETCH_TASK', async () => {
        try {
            // Esegui il tuo codice di background fetch qui
            console.log('Background fetch task executed');
            return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
            console.error(error);
            return BackgroundFetch.BackgroundFetchResult.Failed;
        }
    });
}