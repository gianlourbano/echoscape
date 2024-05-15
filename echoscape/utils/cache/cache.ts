export const cachedFetch: typeof fetch = async (
    url: RequestInfo | URL,
    options: RequestInit = {}
): Promise<Response> => {
    const cacheKey = url;
    const cache = await caches.open("cache");
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await fetch(url, options);
    cache.put(cacheKey, response.clone());
    return response;
};



export async function inCache(url: RequestInfo | URL): Promise<boolean> {
    const cache = await caches.open("cache");
    const cachedResponse = await cache.match(url);
    return cachedResponse !== undefined;
}