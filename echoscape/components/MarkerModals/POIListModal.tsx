import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Card } from 'react-native-paper';
import POICard, { POICardProps } from './POICard';
import { useLocation } from '@/utils/location/location';
import { haversineDistance } from '@/utils/map/routes';




export interface POIListModalProps {
    visible: boolean;
    onClose: () => void;
    data: POICardProps[];
}

const POIListModal: React.FC<POIListModalProps> = ({ visible, onClose, data }) => {
    const loc = useLocation()
    const renderItem = ({ item }: { item: POICardProps }) => {
        if (loc && haversineDistance({latitude: loc.coords.latitude, longitude: loc.coords.longitude}, item.coordinates) < 10000)
        
        return (<POICard
            name={item.name}
            address={item.address}
            coordinates={item.coordinates}
            recommended={item.recommended}
            type={item.type}
            link={item.link}
            additionalInfo={item.additionalInfo}
            onClose={onClose}
        />);

        else return <></>
    }

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose}>
                <Card style={styles.modal}>
                    <Card.Content>
                        <View style={styles.header}>
                            <Text style={styles.title}>Points of Interest</Text>
                            <Button 
                                onPress={onClose} 
                                theme={{
                                    colors: {
                                        primary: "#22c55e",
                                        text: "#22c55e",
                                    }
                                }}>Close</Button>
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
        backgroundColor: '#374151',  //zinc-700
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