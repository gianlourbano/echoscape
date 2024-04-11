import { Link } from "expo-router";
import { Text, View } from "react-native";

const ProfilePage = () => {
    return (
        <View>
            <Text>Profile Page</Text>
            <Link href="/">Home</Link>
        </View>
    );
};

export default ProfilePage;
