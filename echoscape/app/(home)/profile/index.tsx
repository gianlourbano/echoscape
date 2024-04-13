import { Link } from "expo-router";
import { Text, View } from "react-native";
import { Image } from "react-native";

const ProfilePage = () => {
    return (
        <View className="w-full">
            <Image className="size-48"  source={require("../../../assets/image.png")}/>
            <Text className="text-lg">Profile Page</Text>
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
        </View>
    );
};

export default ProfilePage;
