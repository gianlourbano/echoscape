import * as NetUtils from "@/utils/network/NetworkUtils";
import * as NetTypes from "@/utils/network/types";
import { createStrictContext } from "../StrictContext";
import { useEffect, useState } from "react";

const [NetworkProvider_, useNetwork] =
    createStrictContext<NetTypes.NetworkContext>(undefined);

export const NetworkProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [netStatus, setNetStatus] =
        useState<NetTypes.NetStatus>("net-offline");

    useEffect(() => {
        NetUtils.getNetworkStatus().then((status) => {
            setNetStatus(status);
        });


        const unsubscribe = NetUtils.subscribeToNetworkStatus((status) => {
            setNetStatus(status);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <NetworkProvider_
            value={{
                status: netStatus,
            }}
        >
            {children}
        </NetworkProvider_>
    );
};

export { useNetwork };
