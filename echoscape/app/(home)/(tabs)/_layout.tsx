import { Easing, Pressable, View } from "react-native";

//import { MaterialBottomTabs } from "@/components/BottomNavigation/BottomNavigation";
import { BottomNavigation, Icon, PaperProvider } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";

import { Tabs as MaterialBottomTabs } from "expo-router/tabs";
import { router } from "expo-router";

const Header = (props: BottomTabHeaderProps) => {
    return <View></View>;
};

export default function App() {
    return (
        <View className="flex justify-center flex-1">
            <MaterialBottomTabs
                initialRouteName="index"
                screenOptions={{
                    header: Header,
                    // API Reference: https://reactnavigation.org/docs/material-bottom-tab-navigator#options
                }}
                tabBar={({ navigation, state, descriptors, insets }) => {
                    return (
                        <BottomNavigation.Bar
                            animationEasing={Easing.inOut(Easing.ease)}
                            shifting
                            navigationState={state}
                            safeAreaInsets={insets}
                            onTabPress={({ route, preventDefault }) => {
                                const event = navigation.emit({
                                    type: "tabPress",
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (event.defaultPrevented) {
                                    preventDefault();
                                } else {
                                    navigation.dispatch({
                                        ...CommonActions.navigate(
                                            route.name,
                                            route.params
                                        ),
                                        target: state.key,
                                    });
                                }
                            }}
                            renderIcon={({ route, focused, color }) => {
                                const { options } = descriptors[route.key];

                                if (options.tabBarIcon) {
                                    return options.tabBarIcon({
                                        focused,
                                        color,
                                        size: 24,
                                    });
                                }

                                return null;
                            }}
                            getLabelText={({ route }) => {
                                const { options } = descriptors[route.key];
                                const label =
                                    options.tabBarLabel !== undefined &&
                                    typeof options.tabBarLabel === "string"
                                        ? (options.tabBarLabel as string)
                                        : route.name;

                                return label;
                            }}
                        />
                    );
                }}
            >
                <MaterialBottomTabs.Screen
                    name="index"
                    options={{
                        tabBarLabel: "Map",
                        tabBarIcon(props) {
                            return (
                                <Icon
                                    color={props.color}
                                    size={24}
                                    source={
                                        props.focused
                                            ? "map-marker-radius"
                                            : "map-marker-radius-outline"
                                    }
                                />
                            );
                        },
                    }}
                />
                <MaterialBottomTabs.Screen
                    name="post/index"
                    options={{
                        tabBarLabel: "Post",
                        tabBarIcon(props) {
                            return (
                                <Icon
                                    color={props.color}
                                    size={24}
                                    source={
                                        props.focused
                                            ? "music-note"
                                            : "music-note"
                                    }
                                />
                            );
                        },
                    }}
                />
                 <MaterialBottomTabs.Screen
                    name="stats/index"
                    options={{
                        tabBarLabel: "Stats",

                        tabBarIcon(props) {
                            return (
                                <Pressable
                                    onLongPress={() => {
                                        router.navigate("/debug");
                                    }}
                                >
                                    <Icon
                                        color={props.color}
                                        size={24}
                                        // if i click on the icon 5 times, open the debug menu

                                        source={
                                            props.focused
                                                ? "chart-line-variant"
                                                : "chart-line-variant"
                                        }
                                    />
                                </Pressable>
                            );
                        },
                    }}
                />

                <MaterialBottomTabs.Screen
                    name="profile/index"
                    options={{
                        tabBarLabel: "Profile",

                        tabBarIcon(props) {
                            return (
                                    <Icon
                                        color={props.color}
                                        size={24}
                                        // if i click on the icon 5 times, open the debug menu

                                        source={
                                            props.focused
                                                ? "account-circle"
                                                : "account-circle-outline"
                                        }
                                    />
                            );
                        },
                    }}
                />
            </MaterialBottomTabs>
        </View>
    );
}
