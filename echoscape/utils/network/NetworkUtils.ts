import * as NetTypes from "@/utils/network/types";
import NetInfo from "@react-native-community/netinfo";

export const getNetworkStatus = async (): Promise<NetTypes.NetStatus> => {
    const state = await NetInfo.fetch();
    console.log("Network status: " + JSON.stringify(state, null, 2));
    return state.isConnected ? "net-ok" : "net-offline";
};

export const subscribeToNetworkStatus = (
    callback: (status: NetTypes.NetStatus) => void
) => {
    return NetInfo.addEventListener((state) => {
        callback(state.isConnected ? "net-ok" : "net-offline");
    });
};
