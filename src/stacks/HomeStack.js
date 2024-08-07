import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from '../screens/Home';
import PetDetail from "../screens/PetDetail";
import AddPet from "../screens/AddPet";

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
            name="AddPet"
            component={AddPet}
            options={{ headerShown: false }}/>
        <Stack.Screen
            name="PetDetail"
            component={PetDetail}
            options={{ headerShown: false }}/>
        </Stack.Navigator>

    );
}