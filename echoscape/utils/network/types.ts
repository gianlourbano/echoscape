export type NetStatus = "loading" | "net-ok" | "net-offline" | "server-down";

export type NetworkContext = {
    status: NetStatus;
}