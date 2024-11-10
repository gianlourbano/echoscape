import AsyncStorage from "@react-native-async-storage/async-storage";

export const cachedFetch: typeof fetch = async (
    url: RequestInfo | URL,
    options: RequestInit = {}
): Promise<Response> => {
    const cacheKey = typeof url === "string" ? url : url.toString();

    try {
        const cachedResponseText = await AsyncStorage.getItem(cacheKey);

        if (cachedResponseText) {
            return new Response(JSON.parse(cachedResponseText), {
                status: 200,
                statusText: "OK",
                headers: new Headers({
                    "Content-Type": "application/json",
                }),
            });
        }

        const response = await fetch(url, options);
        const responseText = await response.json();
        await AsyncStorage.setItem(cacheKey, JSON.stringify(responseText));
        return new Response(responseText, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        console.error("Failed to fetch ", url, " and cache resource:", error.message);
        return fetch(url, options);
    }
};

export async function inCache(url: RequestInfo | URL): Promise<boolean> {
    const cacheKey = typeof url === "string" ? url : url.toString();

    try {
        const cachedResponse = await AsyncStorage.getItem(cacheKey);
        return cachedResponse !== null;
    } catch (error) {
        console.error("Failed to check cache:", error);
        return false;
    }
}
