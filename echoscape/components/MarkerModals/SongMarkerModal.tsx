import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Animated, StyleProp, ViewStyle } from 'react-native';
import { Modal, Portal, Text, Button, Provider, TextInput, PaperProvider } from 'react-native-paper';
//import Placeholder from './Placeholder'; // Importa il tuo componente Placeholder

interface SongMarkerModalProps {
  visible: boolean
  onDismiss: () => void
  id: number

  contentContainerStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>
}


//TODO sicuramente da cambiare in base a quello che ritorna il backend
interface SongInfoInterface {
    title: string
    artist: string
    album: string
    year: string
}

const SongMarkerModal: React.FC<SongMarkerModalProps> = (
    { visible, onDismiss, id, contentContainerStyle }
) => {
  const [song, setSong] = useState<SongInfoInterface | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSongDetails = async () => {
      setLoading(true);
      // Simulate a fetch request
      //TODO qui mettici la funzione per prendere la roba dalla cache/backend
      const response = await new Promise<SongInfoInterface>((resolve) => setTimeout(() => resolve({
        title: 'Song Title',
        artist: 'Song Artist',
        album: 'Song Album',
        year: 'Song Year',
      }), 1000));

      setSong(response);
      setLoading(false);
    };

    if (visible) {
      fetchSongDetails();
    }
  }, [visible, id]);

  if (loading) return (
    <>
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={contentContainerStyle}>
          <ActivityIndicator size="large" color="#0000ff" />
        </Modal>
      </Portal>
    </>
  )

  else return (
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={contentContainerStyle}> 
          {loading ? (
            <Text>PLACEHOLDER</Text> // Mostra il componente Placeholder mentre la richiesta è in corso
          ) : (
            <>
              <Text>Song Information</Text>
              <TextInput label="Title" value={song?.title ?? ""} mode="outlined" disabled />
              <TextInput label="Artist" value={song?.artist ?? ""} mode="outlined" disabled />
              <TextInput label="Album" value={song?.album ?? ""} mode="outlined" disabled />
              <TextInput label="Year" value={song?.year ?? ""} mode="outlined" disabled />
              <Button mode="contained" onPress={onDismiss}>
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
  );
};

export default SongMarkerModal;