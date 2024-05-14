
import * as SecureStore from "expo-secure-store";

async function ss_save(key: string, value: any) {
    await SecureStore.setItemAsync(key, value);
}

async function ss_get(key: string) {
    return await SecureStore.getItemAsync(key);
}

async function ss_delete(key: string) {
    await SecureStore.deleteItemAsync(key);
}

export { ss_save, ss_get, ss_delete };