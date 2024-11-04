import React, { useState, useEffect } from 'react';
import { StyleSheet, Linking, View } from 'react-native';
import { LatLng } from 'react-native-maps';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { getCoordinatesName } from '@/utils/overpass/request';
import Icon from 'react-native-vector-icons/Octicons';
import { uploadAudio } from '@/utils/tasks/audioUpload';
import { useRouter } from 'expo-router';

export interface POICardProps {
    name: string;
    address?: string;
    coordinates: LatLng;
    recommended: boolean;
    type?: string;
    link?: string;
    additionalInfo?: { label: string; value: string }[];
    onClose?: () => void;
}

const POICard: React.FC<POICardProps> = ({ name, address, coordinates, recommended, link, additionalInfo, type, onClose }) => { 
    const router = useRouter()

    const [resolvedAddress, setResolvedAddress] = useState<string | null>(address || null);

    useEffect(() => {
        if (!address) {
            const fetchAddress = async () => {
                const fetchedAddress = await getCoordinatesName(coordinates);
                setResolvedAddress(fetchedAddress);
            };
            fetchAddress();
        }
    }, [address, coordinates]);


    function handleCardTitlePress() {
        console.log("debug togliere titolo premuto")
        //redirect a /post con url lat e lng
        router.navigate(`/post?lat=${coordinates.latitude}&lng=${coordinates.longitude}`)
        console.log("DEBUG DOPO NAVIGATE AAAAAAAA")
        onClose()
    }

    const getCardStyle = (type?: string) => {
        //TODO i tipi di POI devono coincidere con quelli di overpass
        switch (type) {
            case 'monument':
                return styles.monumentCard;
            case 'building':
                return styles.buildingCard;
            case 'park':
                return styles.parkCard;
            case 'museum':
                return styles.museumCard;
            default:
                return styles.defaultCard;
        }
    };

    return (
        <>
        {/*
        applies, in order:
            default card style
            style based on POI type
            style IF the POI is recommended 
        */}
        <Card style={[styles.card, getCardStyle(type), recommended && styles.recommendedCard]}>
            <Card.Content>
                <Title onPress={handleCardTitlePress}>{name}</Title>
                <View style={styles.streetNameContainer}>
                    <Icon name="diff-renamed" size={16} color="#999" style={styles.icon} />
                    <Paragraph>{resolvedAddress}</Paragraph>
                </View>
                {additionalInfo && additionalInfo.map((info, index) => (
                    <Paragraph key={index}>
                    <Text>
                        <Text style={{ fontWeight: 'bold' }}>{info.label}: </Text>
                        <Text>{info.value}</Text>
                    </Text>
                </Paragraph>
                ))} 
            </Card.Content>
            {link && (
                <Card.Actions>
                    <Button onPress={() => Linking.openURL(link)}>Visit Link</Button>
                </Card.Actions>
            )}
        </Card>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    monumentCard: {
        backgroundColor: '#f8d7da',
    },
    buildingCard: {
        backgroundColor: '#d1ecf1',
    },
    parkCard: {
        backgroundColor: '#d4edda',
    },
    museumCard: {
        backgroundColor: '#fff3cd',
    },
    defaultCard: {
        backgroundColor: '#0f0f0f',
    },
    recommendedCard: {
        borderColor: '#ff0000', 
        borderWidth: 5, 
    },
    icon: {
        marginRight: 8,
    },
    streetNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default POICard;