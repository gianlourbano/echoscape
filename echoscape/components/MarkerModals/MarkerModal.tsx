import { useEffect, useState } from "react";

import { Modal, Portal, Text, Button, PaperProvider } from "react-native-paper";
import SongMarkerModal from "./SongMarkerModal";
import { getMarkerNumber, getMarkerType } from "@/utils/markers/markerId";
import OwnMarker from "./OwnMarker";


interface MarkerModalProps {
    visible: boolean

    currentMarker: string
    setCurrentMarker?: (value: number | null) => void
}

export default function MarkerModal(
    {visible, currentMarker="", setCurrentMarker} : MarkerModalProps
) {

    const [modalType, setModalType] = useState<string>("")

    function hideModal() {
        setCurrentMarker(null)
    }


    const containerStyle = { backgroundColor: "white", padding: 20 };

    useEffect(() => {
        setModalType(getMarkerType(currentMarker))
    }, [currentMarker])

    if (modalType === "audio") 
    return (
        <SongMarkerModal
            visible={visible}
            onDismiss={hideModal}
            id={getMarkerNumber(currentMarker)} 
        />
    )


    else if (modalType === "own")
    return (
        <OwnMarker
            visible={visible}
            onDismiss={hideModal}
        />
    )


    else if (modalType === "audio_group")
    return (
        <></>
    )
    

    else return (
            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={containerStyle}
                >
                    <Text>
                        Example Modal. Click outside this area to dismiss.
                    </Text>
                </Modal>
            </Portal>
    );
};