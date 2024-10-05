import { getRouteNodes, matchPOIsToNodes } from '@/utils/map/routes';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LatLng, MapPressEvent } from 'react-native-maps';
import { IconButton, Button } from 'react-native-paper';

const { height } = Dimensions.get('window');

/* deprecated interface
interface DirectionsSelectorProps {
    onClose: () => void;
    func1?: () => string;
    func2?: () => string;
    startingPoint?: LatLng | null;
    endingPoint?: LatLng | null;
}*/

interface DirectionsSelectorProps {
    onClose: () => void;
    onMapPressEventCoords: LatLng | null;
    onRouteCompute: (coords: LatLng[]) => void;
}

const DirectionsSelector = (
    { onClose, onMapPressEventCoords, onRouteCompute }: DirectionsSelectorProps) => {    
    
    const [componentHeight, setComponentHeight] = useState<number>(0);

    // Stati per controllare il testo nei bottoni
    const [button1Text, setButton1Text] = useState<string>('Start');
    const [button2Text, setButton2Text] = useState<string>('Destination');

    const [selectingStartPoint, setSelectingStartPoint] = useState<boolean>(false)
    const [selectingEndPoint, setSelectingEndPoint] = useState<boolean>(false)

    const [startPoint, setStartPoint] = useState<LatLng | null>(null)
    const [endPoint, setEndPoint] = useState<LatLng | null>(null)

    useEffect(() => {
        const { height } = Dimensions.get('window');
        const componentHeight = height / 5;
        setComponentHeight(componentHeight);
    }, []);

    /*
    onMapPressEventCoords gets changed everytime the user presses on the map.
    if this component is waiting for a press, i.e. to select the destination, the destination will be updated
    else, the event will be ignored
    */
    useEffect(() => {
        if (selectingStartPoint) setStartPoint(onMapPressEventCoords);
        if (selectingEndPoint) setEndPoint(onMapPressEventCoords);
        /*
        fetch name of the points, to put names instead of coordinates in the buttons
        */
       (async () => {
            console.log("[directionsSelector]coords: ", onMapPressEventCoords, " name: ", await getCoordinatesName(onMapPressEventCoords))
            if (selectingStartPoint) setButton1Text(await getCoordinatesName(onMapPressEventCoords))
            if (selectingEndPoint)   setButton2Text(await getCoordinatesName(onMapPressEventCoords))
        })()
        setSelectingStartPoint(false)
        setSelectingEndPoint(false)

    }, [onMapPressEventCoords])


    async function getCoordinatesName(coords: LatLng | null): Promise<string> {
        if (!coords) return ""
        const latitude = coords.latitude
        const longitude = coords.longitude
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.address && data.address.road) {
                return data.address.road;
            } else {
                return `${latitude}, ${longitude}`;
            }
        } catch (error) {
            console.error('DirectionsSelector: Error fetching coordinates name from (',latitude, ' ', longitude,'):', error);
            return `${latitude}, ${longitude}`;
        }
    };

    
    function handleStartButtonPress() {
        console.log("start button pressed!")
        if (selectingEndPoint && !selectingStartPoint) setSelectingEndPoint(false)
        setSelectingStartPoint(prev => !prev)
    }

    function handleEndButtonPress() {
        console.log("end button pressed!")
        if (selectingStartPoint && !selectingEndPoint) setSelectingStartPoint(false)
        setSelectingEndPoint(prev => !prev)
    }

    async function handleGetDirectionsButtonPress() {
        const route = await getRouteNodes(startPoint.latitude, startPoint.longitude, endPoint.latitude, endPoint.longitude)
        onRouteCompute(route)
    }
    
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            height: componentHeight,
            width: '100%',
            backgroundColor: '#f5f5f5',
            padding: 10,
        },
        leftColumn: {
            width: '10%', // Spazio per la croce
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        centerColumn: {
            width: '80%',
            justifyContent: 'center',
        },
        rightColumn: {
            width: '10%', // Spazio per il bottone
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        buttonListening: {
            flex: 1,
            backgroundColor: 'green',  // Bottone attivato
            //padding: 15,
            borderRadius: 5,
            alignItems: 'center',
        },
        buttonInactive: {
            flex: 1,
            backgroundColor: 'gray',  // Bottone disattivato
            //padding: 15,
            borderRadius: 5,
            alignItems: 'center',
        },
    
    });


    return (
        <View style={styles.container}>
            {/* Croce per chiudere */}
            <View style={styles.leftColumn}>
                <IconButton icon="close" size={24} onPress={onClose} />
            </View>

            {/* Bottoni con icone */}
            <View style={styles.centerColumn}>
                <View style={styles.buttonRow}>
                    <IconButton icon="ray-start-arrow" size={24} />
                    <Button
                        mode={selectingStartPoint ? "contained" : "outlined"}
                        onPress={handleStartButtonPress}
                        style={selectingStartPoint ? styles.buttonListening : styles.buttonInactive}
                    >
                        {button1Text}
                    </Button>
                </View>
                <View style={styles.buttonRow}>
                    <IconButton icon="ray-end" size={24} />
                    <Button
                        mode="outlined"
                        onPress={handleEndButtonPress}
                        style={selectingEndPoint ? styles.buttonListening : styles.buttonInactive}
                    >
                        {button2Text}
                    </Button>
                </View>
            </View>

            {/* Bottone sulla destra */}
            <View style={styles.rightColumn}>
                <Button mode="text" onPress={handleGetDirectionsButtonPress}>
                    <IconButton icon="map-marker-right-outline"/>
                </Button>
            </View>
        </View>
    );
};

export default DirectionsSelector;
