
import React, { useState } from "react";
import { View, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useAuth } from "@/utils/auth/AuthProvider";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "expo-router";

export default function LoginPage() {
    const router = useRouter()

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const { dispatch, status } = useAuth();

    const isLoginButtonDisabled = !username || !password;

    return (
        <PageContainer className="bg-zinc-700 h-full flex flex-col justify-center items-center" safe>
            <Image
                source={require("@/assets/image.png")}
                style={{ width: 200, height: 200, marginBottom: 20 }}
            />
            <Text className="text-4xl font-bold text-green-600 mb-4">
                Login to Echoscape
            </Text>
            <View className="w-3/4">
                <TextInput
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    mode="outlined"
                    style={{ backgroundColor: "#374151", marginBottom: 20 }}
                    theme={{
                        colors: {
                            placeholder: "#9CA3AF",
                            text: "#FFFFFF",
                            primary: (status === "error-invalid-credentials") ? "#e32636" : "#22c55e",
                        },
                    }}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={{ backgroundColor: "#374151", marginBottom: 20 }}
                    theme={{
                        colors: {
                            placeholder: "#9CA3AF",
                            text: "#FFFFFF",
                            primary: (status === "error-invalid-credentials") ? "#e32636" : "#22c55e",
                        },
                    }}
                />

                {status === "error-invalid-credentials" && (
                    <Text
                        style={{
                            color: "red",
                            marginBottom: 10,
                            textAlign: "center",
                        }}
                    >
                        Wrong credentials. Please try again.
                    </Text>
                )}

                <Button
                    mode="contained"
                    disabled={isLoginButtonDisabled}
                    onPress={() => {
                        dispatch("login", { username, password });
                    }}
                    contentStyle={{ paddingVertical: 10 }}
                    style={{
                        backgroundColor: isLoginButtonDisabled ? "#9CA3AF" : "#22c55e",
                        marginBottom: 10,
                    }}
                >
                    Login
                </Button>
                <Button
                    mode="text"
                    onPress={() => {
                        router.navigate("/register")
                    }}
                    labelStyle={{ color: "#FFFFFF" }}
                >
                    Don't have an account? <Text style={{color: "#22c55e"}}>Register</Text>
                </Button>
            </View>
        </PageContainer>
    );
}