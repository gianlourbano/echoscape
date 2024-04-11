import {
    createBottomTabNavigator,
    BottomTabNavigationOptions,
  } from '@react-navigation/bottom-tabs';
  
  import { withLayoutContext } from "expo-router";
  
  const { Navigator } = createBottomTabNavigator();
  
  export const MaterialBottomTabs = withLayoutContext<
   // @ts-ignore: fucking shithole that you are
    BottomTabNavigationOptions,
    typeof Navigator
  >(Navigator);
