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
    type?: POIType;
    link?: string;
    additionalInfo?: { label: string; value: string }[];
    onClose?: () => void;
}

export type POIType = '' | 'historic' | 'tourism' | 'leisure' | 'building' | 'place_of_worship';
export function getPOITypeFromOverpassData(item): POIType {

    let type: POIType = ''

    if ('tourism' in item.tags) type = 'tourism'
    else if ('leisure' in item.tags) type = 'leisure'
    else if ('building' in item.tags) type = 'building'
    else if ('amenity' in item.tags) type = 'place_of_worship'
    else if ('historic' in item.tags) type = 'historic'

    return type
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
        router.navigate(`/post?lat=${coordinates.latitude}&lng=${coordinates.longitude}`)
        onClose()
    }

    const getCardStyle = (type?: POIType) => {
        //TODO i tipi di POI devono coincidere con quelli di overpass
        switch (type) {
            case 'historic':
                return styles.historicCard;
            case 'building':
                return styles.buildingCard;
            case 'leisure':
                return styles.leisureCard;
            case 'tourism':
                return styles.tourismCard;
            case 'place_of_worship':
                return styles.worshipCard;
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
                <Title style={styles.textColor} onPress={handleCardTitlePress}>{name}</Title>
                <View style={styles.streetNameContainer}>
                    <Icon name="diff-renamed" size={16} color="#999" style={styles.icon} />
                    <Paragraph style={styles.textColor}>{resolvedAddress}</Paragraph>
                </View>
                <View>
                    <Text style={styles.textColor}>type: {type}</Text>
                </View>
                {additionalInfo && additionalInfo.map((info, index) => (
                    <Paragraph key={index}>
                    <Text>
                        <Text style={[{ fontWeight: 'bold' }, styles.textColor]}>{info.label}: </Text>
                        <Text style={styles.textColor}>{info.value}</Text>
                    </Text>
                </Paragraph>
                ))} 
            </Card.Content>
            {link && (
                <Card.Actions>
                    <Button 
                        onPress={() => Linking.openURL(link)}
                        theme={{
                            colors: {
                                primary: "#22c55e",
                                outline: "#22c55e",
                            }
                        }}
                        // style={{ sets background button color
                        //     backgroundColor: "#FFFFFF"
                        // }}
                    >
                        Visit Link
                    </Button>
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
    historicCard: {
        backgroundColor: '#f8d7da',
    },
    buildingCard: {
        backgroundColor: '#d1ecf1',
    },
    leisureCard: {
        backgroundColor: '#d4edda',
    },
    tourismCard: {
        backgroundColor: '#fff3cd',
    },
    worshipCard: {
        backgroundColor: '#f003cd'
    },
    defaultCard: {
        backgroundColor: '#0f0f0f',
    },
    recommendedCard: {
        borderColor: '#22c55e', 
        borderWidth: 5, 
    },
    icon: {
        marginRight: 8,
    },
    streetNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textColor: {
        color: "black"
    },
});

export default POICard;