import {SafeAreaView} from "react-native";

export default function PageContainer({children, className} : {children: any, className?: string}) {
    return (
        <SafeAreaView className={className}>
            {children}
        </SafeAreaView>
    );
}