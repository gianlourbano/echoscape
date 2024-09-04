import { Link } from "expo-router";
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "@/utils/auth/AuthProvider";

const RegisterPage = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [error, setError] = useState<string>("");

    const { dispatch } = useAuth();

    const handleRegister = () => {
        if(!username) {
            setError("Username is required!");
            return;
        }

        if(!password) {
            setError("Password is required!");
            return;
        }

        if(password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/auth`, {
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
        <View className="p-6 flex flex-col gap-2 bg-zinc-800 text-white h-full">
            <Text className=" text-xl self-center">Register Page</Text>

            <View className="flex flex-col gap-2 m-4 text-white">
                {/* <Text>Username</Text> */}
                <TextInput
                    className="rounded-md p-4 bg-gray-500 mb-4 w-full text-white placeholder:color-gray-400"
                    inlineImageLeft="search_icon"
                    placeholder="Username"
                    onChangeText={setUsername}
                />
                {/* <Text>Password</Text> */}
                <TextInput
                    className="rounded-md p-4 bg-gray-500 mb-4 w-full placeholder:color-gray-400 text-white"
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                />
                {/* <Text>Confirm password</Text> */}
                <TextInput
                    className="rounded-md p-4 bg-gray-500 mb-4 w-full placeholder:color-gray-400 text-white"
                    placeholder="Confirm Password"
                    secureTextEntry={!showPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>
            <Button onPress={handleRegister}>Register</Button>
            {error && <Text className="text-red-500">{error}</Text>}
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
