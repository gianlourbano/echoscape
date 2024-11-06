
import React, { useState } from "react";
import { View, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useAuth } from "@/utils/auth/AuthProvider";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "expo-router";

const RegisterPage = () => {
    const router = useRouter();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [error, setError] = useState<string>("");

    const { dispatch } = useAuth();

    const isRegisterButtonDisabled = !username || !password || !confirmPassword;

    const handleRegister = () => {
        setError("");

        if (password !== confirmPassword) {
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
            .then(async (res) => {
                if (res.ok) {
                    dispatch("login", { username, password });
                } else {
                    const data = await res.json();
                    setError("Error: " + data.detail);
                }
            })
            .catch((err) => {
                console.log("[register page] Errore durante la registrazione: ", err);
                setError("Error: " + err);
            });
    };

    return (
        <PageContainer className="bg-zinc-700 h-full flex flex-col justify-center items-center">
            <Image
                source={require("@/assets/image.png")}
                style={{ width: 200, height: 200, marginBottom: 20 }}
            />
            <Text className="text-4xl font-bold text-green-600 mb-4">
                Register to Echoscape
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
                            primary: error ? "#e32636" : "#22c55e",
                        },
                    }}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={{ backgroundColor: "#374151", marginBottom: 20 }}
                    theme={{
                        colors: {
                            placeholder: "#9CA3AF",
                            text: "#FFFFFF",
                            primary: error ? "#e32636" : "#22c55e",
                        },
                    }}
                />
                <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={{ backgroundColor: "#374151", marginBottom: 20 }}
                    theme={{
                        colors: {
                            placeholder: "#9CA3AF",
                            text: "#FFFFFF",
                            primary: error ? "#e32636" : "#22c55e",
                        },
                    }}
                />

                {error && (
                    <Text
                        style={{
                            color: "red",
                            marginBottom: 10,
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </Text>
                )}

                <Button
                    mode="contained"
                    disabled={isRegisterButtonDisabled}
                    onPress={handleRegister}
                    contentStyle={{ paddingVertical: 10 }}
                    style={{
                        backgroundColor: isRegisterButtonDisabled ? "#9CA3AF" : "#22c55e",
                        marginBottom: 10,
                    }}
                >
                    Register
                </Button>
                <Button
                    mode="text"
                    onPress={() => {
                        router.navigate("/login");
                    }}
                    labelStyle={{ color: "#FFFFFF" }}
                >
                    Hai già un account? <Text style={{ color: "#22c55e" }}>Login</Text>
                </Button>
            </View>
        </PageContainer>
    );
};

export default RegisterPage;