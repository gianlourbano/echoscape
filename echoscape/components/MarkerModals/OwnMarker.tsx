import { Animated, StyleProp, ViewStyle, Text } from "react-native";
import { Modal, Portal } from "react-native-paper";




interface OwnMarkerProps {
    visible: boolean
    onDismiss: () => void

    contentContainerStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>
}

export default function OwnMarker(
    {visible, onDismiss, contentContainerStyle} : OwnMarkerProps
) {
    return (
    <Portal>
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={contentContainerStyle}
        >
            <Text>
                Qui sei tu!
            </Text>
        </Modal>
    </Portal>
    )
}