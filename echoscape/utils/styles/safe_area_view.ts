import { StyleSheet, Platform, StatusBar } from "react-native";

export default StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: Platform.OS === "android" ? "#3f3f46" : undefined,  //zinc-700
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  }
});


/*
zinc-700 #3f3f46
zinc-600 #27272a
*/