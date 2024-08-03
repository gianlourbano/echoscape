import { useCallback, useEffect, useReducer, useState } from "react";
import { createStrictContext } from "@/utils/StrictContext";

import { ss_save, ss_get, ss_delete } from "@/utils/secureStore/SStore";
import {
    AuthContext,
    AuthStatus,
    UserData,
    Action,
    AuthDispatchMsgCode,
} from "./types";
import { useRouter } from "expo-router";

import * as FileSystem from "expo-file-system";

const [AuthProvider_, useAuth] = createStrictContext<AuthContext>(undefined);

const getToken = async (payload: { username: string; password: string }) => {
    const res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/auth/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `username=${payload.username}&password=${payload.password}`,
        }
    ).catch((e) => {
        console.log(e);
        console.log("Error while fetching token");
        return null;
    });

    if (!res) {
        console.log("Error while fetching token");
        return { error: "server-500" };
    }

    const data = await res.json();

    if (res.status !== 200) {
        console.log("Error while fetching token");
        return { error: "invalid-credentials" };
    }

    await ss_save("token", data.client_secret);
    await ss_save(
        "lastUpdate",
        new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
    );

    return data;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authStatus, setAuthStatus] = useState<AuthStatus>("unauthenticated");
    const [user, setUser] = useState<UserData | undefined>(undefined);

    const router = useRouter();

    const authDispatchAsync = useCallback(
        async (
            action: Action,
            payload?: any
        ): Promise<AuthDispatchMsgCode | undefined> => {
            switch (action) {
                case "refresh": {
                    setAuthStatus("loading");
                    console.log("trying to refresh token...");
                    if (authStatus === "authenticated") {
                        const username = await ss_get("username");
                        const password = await ss_get("password");

                        if (!username || !password) {
                            return authDispatchAsync("logout");
                        }

                        payload = {
                            username,
                            password,
                        };
                    } else {
                        return authDispatchAsync("logout");
                    }
                    console.log("refreshing token with", payload);

                    const data = await getToken(payload);

                    setAuthStatus("authenticated");
                    return "REFRESH_SUCCESFUL";
                }
                case "logout": {
                    await ss_delete("token");
                    await ss_delete("lastUpdate");
                    await ss_delete("username");
                    await ss_delete("password");

                    setAuthStatus("unauthenticated");
                    router.navigate("/login");

                    return "LOGOUT_SUCCESFUL";
                }
                case "login": {
                    setAuthStatus("loading");
                    // Do login

                    if (!payload.username || !payload.password) {
                        setAuthStatus("error-invalid-credentials");
                        return "LOGIN_FAILED";
                    }

                    const data = await getToken(payload);
                    if (data.error) {
                        setAuthStatus(`error-${data.error}`);
                        return "LOGIN_FAILED";
                    }

                    await ss_save("id", String(data.client_id));
                    await ss_save("username", payload.username);
                    await ss_save("password", payload.password);

                    const token = await ss_get("token");
                    const lastUpdate = await ss_get("lastUpdate");

                    console.log(token);
                    console.log(lastUpdate);

                    await FileSystem.makeDirectoryAsync(
                        FileSystem.documentDirectory +
                            `user-${payload.username}`,
                        {
                            intermediates: true,
                        }
                    );

                    setAuthStatus("authenticated");
                    router.navigate("/");
                    return "LOGIN_SUCCESFUL";
                }
            }
        },
        []
    );

    const withAuthFetch = useCallback(
        async (
            url: URL | RequestInfo,
            options: RequestInit | undefined,
            _fetch = fetch
        ): Promise<Response> => {
            const token = await ss_get("token");
            const lastUpdate = await ss_get("lastUpdate");

            // if (!isConnected) {
            //     setAuthStatus("error-no-connection");
            //     return new Response(null, { status: 503 });
            // }

            if (
                !token ||
                !lastUpdate ||
                new Date(lastUpdate) < new Date(Date.now())
            ) {
                const statusCode = await authDispatchAsync("refresh");
                console.log(`Refreshing token (status ${statusCode})`);
                if (statusCode === "REFRESH_SUCCESFUL")
                    return withAuthFetch(url, options);
                else
                    return new Response("error-token-refresh", { status: 502 });
            }

            return _fetch(url, {
                ...options,
                headers: {
                    ...options?.headers,
                    Authorization: `Bearer ${token}`,
                },
            }).then(async (res) => {
                console.log("AuthFetch status: " + res.status);

                if (res.status === 401) {
                    console.log("Token expired, rescheduling");
                    const statusCode = await authDispatchAsync("refresh");
                    if (statusCode === "REFRESH_SUCCESFUL")
                        return withAuthFetch(url, options);
                    else {
                        setAuthStatus("error-refresh-failed");
                        return res;
                    }
                }

                return res;
            });
        },
        []
    );

    useEffect(() => {
        const checkAuth = async () => {
            const token = await ss_get("token");
            if (token) {
                setAuthStatus("authenticated");
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthProvider_
            value={{
                status: authStatus,
                dispatch: authDispatchAsync,
                withAuthFetch,
            }}
        >
            {children}
        </AuthProvider_>
    );
};

export { useAuth };
