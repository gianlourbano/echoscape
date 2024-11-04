export type AuthDispatchMsgCode =
    | "REFRESH_SUCCESFUL"
    | "REFRESH_FAILED"
    | "LOGIN_SUCCESFUL"
    | "LOGIN_FAILED"
    | "LOGOUT_SUCCESFUL"
    | "LOGOUT_FAILED"
    | "LOADING"
    | "ERROR";

export type Error = string;
export type Action = "login" | "logout" | "refresh";

export type AuthStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | `error-${Error}`
    | "initial";

export type UserData = {
    username: string;
    id: string;
    url?: string;
};

export type AuthContext = {
    user: UserData | undefined;
    status: AuthStatus;
    dispatch: (
        action: Action,
        payload?: any
    ) => Promise<AuthDispatchMsgCode | undefined>;
    withAuthFetch: (
        url: string,
        options?: RequestInit,
        _fetch?: typeof fetch
    ) => Promise<Response | undefined>;
    //user: UserData | undefined;
};
