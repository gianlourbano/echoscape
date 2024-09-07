import useSwr, { SWRConfiguration } from "swr";
import { useAuth } from "@/utils/auth/AuthProvider";
import { cachedFetch } from "@/utils/cache/cache";

interface FetchOptions {
    cache?: boolean;
    postProcess?: (data: any) => any;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    headers?: any;
    swrConfig?: SWRConfiguration;
}

const defaultOptions: FetchOptions = {
    cache: true,
    postProcess: undefined,
    method: "GET",
    body: undefined,
    headers: undefined,
    swrConfig: {},
};

export const useFetch = (
    url: string,
    options: FetchOptions = defaultOptions
) => {
    const { withAuthFetch } = useAuth();
    const { data, isLoading, error, mutate } = useSwr(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}${url}`,
        async (url) =>
            withAuthFetch(
                url,
                {
                    method: options.method,
                    body: options.body,
                    headers: options.headers,
                },
                options.cache ? cachedFetch : fetch
            ).then(async (res) => {
                const j = await res.json();
                return options.postProcess ? options.postProcess(j) : j;
            }),
        options.swrConfig
    );

    return {
        data,
        isLoading,
        error,
        mutate,
    };
};
