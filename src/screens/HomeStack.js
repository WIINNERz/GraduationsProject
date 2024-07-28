import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./Home";
import PetDetail from "../components/PetDetail";

export default function HomeStack(){
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator>
        <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="PetDetail"
            component={PetDetail}
            options={{ headerShown: false }}/>
        </Stack.Navigator>

    );
}