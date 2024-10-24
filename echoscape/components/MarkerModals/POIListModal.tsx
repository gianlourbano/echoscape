import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Card } from 'react-native-paper';
import POICard, { POICardProps } from './POICard';




export interface POIListModalProps {
    visible: boolean;
    onClose: () => void;
    data: POICardProps[];
}

const POIListModal: React.FC<POIListModalProps> = ({ visible, onClose, data }) => {
    const renderItem = ({ item }: { item: POICardProps }) => (
        <POICard
            name={item.name}
            address={item.address}
            coordinates={item.coordinates}
            recommended={item.recommended}
            link={item.link}
            additionalInfo={item.additionalInfo}
            onClose={onClose}
        />
    );

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose}>
                <Card style={styles.modal}>
                    <Card.Content>
                        <View style={styles.header}>
                            <Text style={styles.title}>Points of Interest</Text>
                            <Button onPress={onClose}>Close</Button>
                        </View>
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.list}
                        />
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 20,
    },
});


export default POIListModal;