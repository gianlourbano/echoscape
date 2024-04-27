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
export type Action =
    | "login"
    | "logout"
    | "refresh"

export type AuthStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | `error-${Error}`;

export type UserData = {
    username: string;
    id: string;
};

export type AuthContext = {
    status: AuthStatus;
    dispatch: (
        action: Action,
        payload?: any
    ) => Promise<AuthDispatchMsgCode | undefined>;
    withAuthFetch: (
        url: string,
        options: RequestInit
    ) => Promise<Response | undefined>;
    //user: UserData | undefined;
};
