import { getRouteNodes, matchPOIsToNodes } from '@/utils/map/routes';
import { createOverpassPathQuery, fetchOverpass, getCoordinatesName } from '@/utils/overpass/request';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LatLng } from 'react-native-maps';
import { IconButton, Button } from 'react-native-paper';
import { POICardProps } from '../MarkerModals/POICard';
import { isPOIRecommended } from '@/utils/overpass/POIsAudios_Associations';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    onRouteCompute: (coords: LatLng[]) => void;  //receives route nodes
    onPOIsFetch: (POIs: POICardProps[]) => void;  //receives already formatted data for POI cards
    setDirectionsMarkers?: Dispatch<SetStateAction<({startingPoint: LatLng | null, endingPoint: LatLng | null})>>    //setstate function from useState to show start and end point on the map
    defaultEndingPoint?: LatLng | null; //if given and not null, the directions menu will open using this point as the starting point
}

const DirectionsSelector = (
    { onClose, onMapPressEventCoords, onRouteCompute, onPOIsFetch, setDirectionsMarkers, defaultEndingPoint }: DirectionsSelectorProps) => {    
    
    const [componentHeight, setComponentHeight] = useState<number>(0);

    const [button1Text, setButton1Text] = useState<string>('Start');
    const [button2Text, setButton2Text] = useState<string>('Destination');

    const [selectingStartPoint, setSelectingStartPoint] = useState<boolean>(false)
    const [selectingEndPoint, setSelectingEndPoint] = useState<boolean>(false)

    const [startPoint, setStartPoint] = useState<LatLng | null>(null)
    const [endPoint, setEndPoint] = useState<LatLng | null>(null)

    useEffect(() => {
        /*
        set component height to occupy only the top of the page
        */
        const { height } = Dimensions.get('window');
        const componentHeight = height / 5;
        setComponentHeight(componentHeight);

        /*
        if a starting point was selected before opening the menu: 
            - set it as the starting point
            - toggle end point selection
        */
        (async () => {
            if (defaultEndingPoint) {
                handleEndPointChange(defaultEndingPoint) 
                setButton2Text(await getCoordinatesName(defaultEndingPoint))
            }
            console.log(`[directionsSelector] default ending point ${defaultEndingPoint ? `selected: latitude: ${defaultEndingPoint.latitude} longitude: ${defaultEndingPoint.longitude} ` : "not selected"}`)
        })()
    }, []);

    /*
    onMapPressEventCoords gets changed everytime the user presses on the map.
    if this component is waiting for a press, i.e. to select the destination, the destination will be updated
    else, the event will be ignored
    */
    useEffect(() => {
        if (selectingStartPoint) handleStartPointChange(onMapPressEventCoords);
        if (selectingEndPoint) handleEndPointChange(onMapPressEventCoords);
        /*
        fetch name of the points, to put names instead of coordinates in the buttons
        */
       (async () => {            
            //fetch name of selected points
            console.log("[directionsSelector]map pressed on coords: ", onMapPressEventCoords, " name: ", await getCoordinatesName(onMapPressEventCoords))
            if (selectingStartPoint) setButton1Text(await getCoordinatesName(onMapPressEventCoords))
            if (selectingEndPoint)   setButton2Text(await getCoordinatesName(onMapPressEventCoords))
        })()
        setSelectingStartPoint(false)
        setSelectingEndPoint(false)

    }, [onMapPressEventCoords])





    function handleStartPointChange(newStartPoint: LatLng) {
        setStartPoint(newStartPoint)
        setDirectionsMarkers(prev => ({ ...prev, startingPoint: newStartPoint }))
    }

    function handleEndPointChange(newEndPoint: LatLng) {
        setEndPoint(newEndPoint)
        setDirectionsMarkers(prev => ({...prev, endingPoint: newEndPoint}))
    }

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
        if (!startPoint || !endPoint) return;

        const route = await getRouteNodes(startPoint.latitude, startPoint.longitude, endPoint.latitude, endPoint.longitude)
        onRouteCompute(route)

        const overpassResponse = await fetchOverpass(createOverpassPathQuery(route))
        console.log("[directionsSelector DEBUG] POIs in route: ", (overpassResponse).elements.map(element => element.tags.name), "addresses: ", (overpassResponse).elements.map(element => element))
        //warning: long log - console.log("[directionsSelector] route computed (should be displayed as a polyline on the map: ", route)

        //cast to POIcardProps type
        const POICardsInfo = await Promise.all(overpassResponse.elements.map(async (element) => {
            const poiRecommendation = await isPOIRecommended({latitude: element.lat, longitude: element.lon})
            const cardInfo: POICardProps = {
                name: element.tags.name,
                address: element.tags["addr:street"],
                coordinates: {latitude: element.lat, longitude: element.lon},
                recommended: poiRecommendation,
                link: element.tags.wikipedia ? `https://it.wikipedia.org/wiki/${element.tags.wikipedia}` : null,
                additionalInfo: [
                    {label: "recommended", value: poiRecommendation ? "yes" : "no"}
                ]
            };

            return cardInfo
        }))
        onPOIsFetch(POICardsInfo)

    }

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
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
        <SafeAreaView style={styles.container}>
            {/* close button */}
            <View style={styles.leftColumn}>
                <IconButton icon="close" size={24} onPress={onClose} />
            </View>

            {/* map buttons */}
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

            {/* route computation button */}
            <View style={styles.rightColumn}>
                <Button 
                    mode="text" 
                    onPress={handleGetDirectionsButtonPress}
                    disabled={!startPoint || !endPoint}
                >
                    <IconButton icon="map-marker-right-outline" iconColor={!startPoint || !endPoint ? 'grey' : 'black'}/>
                </Button>
            </View>
        </SafeAreaView>
    );
};

export default DirectionsSelector;
