import { usePlaySound, useRecordSound } from "@/app/hooks/useSound";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";


import testSound1 from "../../../assets/3515__patchen__tone-1.wav"
import testSound2 from "../../../assets/130604__delta_omega_muon__dtmf_tone.wav"
import testSound3 from "../../../assets/18987__johnnypanic__bass-tone.wav"
import ConditionalButton from "@/components/conditionalButton";


export default function Page() {



  const playSound = usePlaySound()
  const { startRecording, stopRecording } = useRecordSound()

  const [isRecording, setIsRecording] = useState(false)   //used for conditionalButton

  const [recordedAudioUri, setRecordedAudioUri] = useState<string|null|undefined>()

  async function testFunction() {
    playSound(testSound2)
  }

  async function startRecordButton() {
    startRecording()
  }

  async function stopRecordButton() {

    const uri = await stopRecording()
    console.log("recorded sound URI: ", uri)

    setRecordedAudioUri(uri)
  }





  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>

        <Button mode="contained" onPress={testFunction}>riproduci suono predefinito</Button>

        <ConditionalButton 
          Button1 = {<Button onPress={stopRecordButton}>finisci registrazione</Button>}
          Button2 = {<Button onPress={startRecordButton}>inizia a registrare</Button>}
          showButton1 = {isRecording}
          setShowButton1={setIsRecording}
        />

        <Button 
          mode="contained"
          disabled = {!recordedAudioUri}
          onPress = {() => {playSound({uri: recordedAudioUri})}}>riproduci suono
        </Button>

        <Text style={styles.subtitle}>This is the first page of your app.</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});