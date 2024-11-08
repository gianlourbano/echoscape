
import { getRouteNodes, matchPOIsToNodes } from '@/utils/map/routes';
import { createOverpassPathQuery, fetchOverpass, getCoordinatesName } from '@/utils/overpass/request';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LatLng } from 'react-native-maps';
import { IconButton, Button, Text } from 'react-native-paper';
import { getPOITypeFromOverpassData, POICardProps } from '../MarkerModals/POICard';
import { isPOIRecommended } from '@/utils/overpass/POIsAudios_Associations';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DirectionsSelectorProps {
  onClose: () => void;
  onMapPressEventCoords: LatLng | null;
  onRouteCompute: (coords: LatLng[]) => void;
  onPOIsFetch: (POICardProps: POICardProps[]) => void;
  setDirectionsMarkers?: Dispatch<
    SetStateAction<{ startingPoint: LatLng | null; endingPoint: LatLng | null }>
  >;
  defaultEndingPoint?: LatLng | null;
}

const DirectionsSelector = ({
  onClose,
  onMapPressEventCoords,
  onRouteCompute,
  onPOIsFetch,
  setDirectionsMarkers,
  defaultEndingPoint,
}: DirectionsSelectorProps) => {
  const [button1Text, setButton1Text] = useState<string>('Start');
  const [button2Text, setButton2Text] = useState<string>('Destination');

  const [selectingStartPoint, setSelectingStartPoint] = useState<boolean>(false);
  const [selectingEndPoint, setSelectingEndPoint] = useState<boolean>(false);

  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<LatLng | null>(null);

  useEffect(() => {
    if (defaultEndingPoint) {
      handleEndPointChange(defaultEndingPoint);
      getCoordinatesName(defaultEndingPoint).then(setButton2Text);
    }
  }, []);

  useEffect(() => {
    if (selectingStartPoint && onMapPressEventCoords) {
      handleStartPointChange(onMapPressEventCoords);
      getCoordinatesName(onMapPressEventCoords).then(setButton1Text);
      setSelectingStartPoint(false);
    }
    if (selectingEndPoint && onMapPressEventCoords) {
      handleEndPointChange(onMapPressEventCoords);
      getCoordinatesName(onMapPressEventCoords).then(setButton2Text);
      setSelectingEndPoint(false);
    }
  }, [onMapPressEventCoords]);

  function handleStartPointChange(newStartPoint: LatLng) {
    setStartPoint(newStartPoint);
    setDirectionsMarkers?.((prev) => ({ ...prev, startingPoint: newStartPoint }));
  }

  function handleEndPointChange(newEndPoint: LatLng) {
    setEndPoint(newEndPoint);
    setDirectionsMarkers?.((prev) => ({ ...prev, endingPoint: newEndPoint }));
  }

  function handleStartButtonPress() {
    if (selectingEndPoint) setSelectingEndPoint(false);
    setSelectingStartPoint((prev) => !prev);
  }

  function handleEndButtonPress() {
    if (selectingStartPoint) setSelectingStartPoint(false);
    setSelectingEndPoint((prev) => !prev);
  }

  function handleSwapButtonPress() {
    const startPointValue = startPoint
    const endPointValue = endPoint
    setStartPoint(endPointValue)
    setEndPoint(startPointValue)

    const button1TextValue = button1Text
    const button2TextValue = button2Text
    setButton1Text(button2Text)
    setButton2Text(button1Text)
  }

  async function handleGetDirectionsButtonPress() {
    if (!startPoint || !endPoint) return;

    const route = await getRouteNodes(
      startPoint.latitude,
      startPoint.longitude,
      endPoint.latitude,
      endPoint.longitude
    );
    onRouteCompute(route);

    const overpassResponse = await fetchOverpass(createOverpassPathQuery(route));
    const POICardsInfo = await Promise.all(
      overpassResponse.elements.map(async (element) => {
        const poiRecommendation = await isPOIRecommended({
          latitude: element.lat,
          longitude: element.lon,
        });
        const cardInfo: POICardProps = {
          name: element.tags.name,
          address: element.tags['addr:street'],
          coordinates: { latitude: element.lat, longitude: element.lon },
          recommended: poiRecommendation,
          type: getPOITypeFromOverpassData(element),
          link: element.tags.wikipedia
            ? `https://it.wikipedia.org/wiki/${element.tags.wikipedia}`
            : null,
          additionalInfo: [{ label: 'recommended', value: poiRecommendation ? 'yes' : 'no' }],
        };

        return cardInfo;
      })
    );
    onPOIsFetch(POICardsInfo);
  }

  // Stili
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      backgroundColor: '#374151', // Tailwind class bg-zinc-700
      padding: 10,
      alignItems: 'center',
    },
    leftColumn: {
      width: '20%', // Aumentato per ospitare due bottoni
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    centerColumn: {
      width: '70%', // Ridotto per bilanciare lo spazio
      justifyContent: 'center',
    },
    rightColumn: {
      width: '10%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    button: {
      flex: 1,
      marginLeft: 5,
    },
    buttonListening: {
      backgroundColor: '#22c55e', // Tailwind class text-green-600
    },
    buttonInactive: {
      backgroundColor: '#4B5563', // Tailwind class bg-gray-600
    },
    buttonText: {
      color: '#FFFFFF', // Testo bianco
      fontSize: 16,
      textTransform: 'none',
    },
    icon: {
      marginRight: 5,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Colonna sinistra con i bottoni */}
      <View style={styles.leftColumn}>
        {/* Bottone Close */}
        <IconButton
          icon="close"
          size={24}
          onPress={onClose}
          iconColor="#FFFFFF"
        />
        {/* invert buttons */}
        <IconButton
          icon="swap-vertical"
          size={24}
          onPress={handleSwapButtonPress}
          iconColor="#FFFFFF"
        />
      </View>

      {/* Bottoni per la Mappa */}
      <View style={styles.centerColumn}>
        <View style={styles.buttonRow}>
          <IconButton icon="ray-start-arrow" size={24} iconColor="#FFFFFF" />
          <Button
            mode={selectingStartPoint ? 'contained' : 'outlined'}
            onPress={handleStartButtonPress}
            style={[styles.button, selectingStartPoint ? styles.buttonListening : styles.buttonInactive]}
            labelStyle={styles.buttonText}
            contentStyle={{ paddingVertical: 5 }}
          >
            {button1Text}
          </Button>
        </View>
        <View style={styles.buttonRow}>
          <IconButton icon="ray-end" size={24} iconColor="#FFFFFF" />
          <Button
            mode={selectingEndPoint ? 'contained' : 'outlined'}
            onPress={handleEndButtonPress}
            style={[styles.button, selectingEndPoint ? styles.buttonListening : styles.buttonInactive]}
            labelStyle={styles.buttonText}
            contentStyle={{ paddingVertical: 5 }}
          >
            {button2Text}
          </Button>
        </View>
      </View>

      {/* Bottone per calcolare il percorso */}
      <View style={styles.rightColumn}>
        <Button onPress={handleGetDirectionsButtonPress} disabled={!startPoint || !endPoint}>
          <IconButton
            icon="map-marker-right-outline"
            size={24}
            iconColor={!startPoint || !endPoint ? '#6B7280' : '#22c55e'}
          />
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default DirectionsSelector;