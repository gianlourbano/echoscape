import { useAuth } from "@/utils/auth/AuthProvider";
import { Link } from "expo-router";
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button, Text } from "react-native-paper";

const LoginPage = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const { dispatch, status } = useAuth();

    return (
        <View className="p-6 flex flex-col gap-2 bg-gray-800 text-white h-full">
            <Text className=" text-xl self-center">Login Page</Text>

            <View className="flex flex-col gap-2 m-4 text-white">
                <Text>Username</Text>
                <TextInput
                    className="rounded-md p-4 bg-gray-500 mb-4 w-full text-white placeholder:color-gray-400"
                    inlineImageLeft="search_icon"
                    placeholder="Username"
                    onChangeText={setUsername}
                />
                <Text>Password</Text>
                <TextInput
                    className="rounded-md p-4 bg-gray-500 mb-4 w-full placeholder:color-gray-400 text-white"
                    inlineImageLeft="search_icon"
                    placeholder="Password"
                    onChangeText={setPassword}
                />
            </View>
            <Text>{status}</Text>
            <Button onPress={() => {
                dispatch("login", {
                    username, password
                })
            }}>Login</Button>
            <Link href="/register">Register</Link>
            <Link href="/">Go Home!</Link>

        </View>
    );
};

export default LoginPage;
