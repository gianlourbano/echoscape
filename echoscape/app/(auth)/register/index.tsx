import { Link } from "expo-router";
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button, Text } from "react-native-paper";

import * as FileSystem from "expo-file-system";
import { getUserBaseURI } from "@/utils/fs/fs";
import { useAuth } from "@/utils/auth/AuthProvider";

const RegisterPage = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const { dispatch } = useAuth();

    const handleRegister = () => {
        fetch(`http://130.136.2.83/auth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(JSON.stringify(data, null, 2));
                dispatch("login", { username, password });
            })
            .catch((err) => {
                console.error(JSON.stringify(err, null, 2));
            });
    };

    return (
        <View className="p-6 flex flex-col gap-2 bg-gray-800 text-white h-full">
            <Text className=" text-xl self-center">Register Page</Text>

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
            <Button onPress={handleRegister}>Register</Button>
            <View className="flex flex-row gap-2 items-center">
                <Text>Already have an account?</Text>
                <Link href="/login" className="text-white" asChild>
                    <Button>Login</Button>
                </Link>
            </View>
            <Link href="/" className="text-white">
                Go Home!
            </Link>
        </View>
    );
};

export default RegisterPage;
