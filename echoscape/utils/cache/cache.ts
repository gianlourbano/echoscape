import AsyncStorage from '@react-native-async-storage/async-storage';

export const cachedFetch: typeof fetch = async (
    url: RequestInfo | URL,
    options: RequestInit = {}
): Promise<Response> => {
    const cacheKey = typeof url === 'string' ? url : url.toString();

    try {
        console.log("DEBUG CACHEKEY: ", cacheKey)
        const cachedResponseText = await AsyncStorage.getItem(cacheKey);

        if (cachedResponseText) {
            console.log(cacheKey, " era in cache")
            return new Response(cachedResponseText);
        }

        const response = await fetch(url, options);
        const responseText = await response.text();
        await AsyncStorage.setItem(cacheKey, responseText);
        return new Response(responseText, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    } catch (error) {
        console.error('Failed to fetch and cache resource:', error);
        return fetch(url, options);
    }
};

export async function inCache(url: RequestInfo | URL): Promise<boolean> {
    const cacheKey = typeof url === 'string' ? url : url.toString();

    try {
        const cachedResponse = await AsyncStorage.getItem(cacheKey);
        console.log("DEBUG cachedResponse: ", url, !!cachedResponse)
        return cachedResponse !== null;
    } catch (error) {
        console.error('Failed to check cache:', error);
        return false;
    }
}