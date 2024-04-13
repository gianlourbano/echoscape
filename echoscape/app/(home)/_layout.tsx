import { StatusBar } from "expo-status-bar";
import { Easing, StyleSheet, Text, View } from "react-native";

//import { MaterialBottomTabs } from "@/components/BottomNavigation/BottomNavigation";
import { BottomNavigation, Icon, PaperProvider } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";

import {Tabs as MaterialBottomTabs} from "expo-router/tabs"


export default function App() {
    return (
        <PaperProvider>
            <View className="flex justify-center flex-1 bg-[#e6e6e6]">
                <MaterialBottomTabs
                    screenOptions={
                        {
                            // API Reference: https://reactnavigation.org/docs/material-bottom-tab-navigator#options
                        }
                    }
                    // tabBar={({ navigation, state, descriptors, insets }) => {  return (
                    //     <BottomNavigation.Bar
                    //         animationEasing={Easing.inOut(Easing.ease)}
                    //         shifting
                    //         navigationState={state}
                    //         safeAreaInsets={insets}
                    //         onTabPress={({ route, preventDefault }) => {
                    //             const event = navigation.emit({
                    //                 type: "tabPress",
                    //                 target: route.key,
                    //                 canPreventDefault: true,
                    //             });

                    //             if (event.defaultPrevented) {
                    //                 preventDefault();
                    //             } else {
                    //                 navigation.dispatch({
                    //                     ...CommonActions.navigate(
                    //                         route.name,
                    //                         route.params
                    //                     ),
                    //                     target: state.key,
                    //                 });
                    //             }
                    //         }}
                    //         renderIcon={({ route, focused, color }) => {
                    //             const { options } = descriptors[route.key];


                    //             if (options.tabBarIcon) {
                    //                 return options.tabBarIcon({
                    //                     focused,
                    //                     color,
                    //                     size: 24,
                    //                 });
                    //             }

                    //             return null;
                    //         }}
                    //         getLabelText={({ route }) => {
                    //             const { options } = descriptors[route.key];
                    //             const label =
                    //                 options.tabBarLabel !== undefined &&
                    //                 typeof options.tabBarLabel === "string"
                    //                     ? (options.tabBarLabel as string)
                    //                     : route.name;

                    //             return label;
                    //         }}
                    //     />
                    // )}}
                >
                    <MaterialBottomTabs.Screen
                        name="index"
                        options={{
                            tabBarLabel: "Alpha",
                            tabBarIcon(props) {
                                return (
                                    <Icon
                                        color={props.color}
                                        size={24}
                                        source={
                                            props.focused
                                                ? "alpha-a-circle"
                                                : "alpha-a-circle-outline"
                                        }
                                    />
                                );
                            },
                        }}
                    />
                    <MaterialBottomTabs.Screen
                        name="second"
                        options={{
                            tabBarLabel: "Beta",
                            tabBarIcon(props) {
                                return (
                                    <Icon
                                        color={props.color}
                                        size={24}
                                        source={
                                            props.focused
                                                ? "alpha-b-circle"
                                                : "alpha-b-circle-outline"
                                        }
                                    />
                                );
                            },
                        }}
                    />
                    <MaterialBottomTabs.Screen
                        name="profile/index"
                        options={{
                            tabBarLabel: "Post this!",
                            tabBarIcon(props) {
                                return (
                                    <Icon
                                        color={props.color}
                                        size={24}
                                        source={
                                            props.focused
                                                ? "alpha-c-circle"
                                                : "alpha-c-circle-outline"
                                        }
                                    />
                                );
                            },
                        }}
                    />
                    
                </MaterialBottomTabs>
            </View>
        </PaperProvider>
    );
}
