import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PetDetail from "../screens/PetDetail";
import AddPet from "../screens/AddPet";
import PetProfile from "../screens/PetProfile";
import MyPet from "../screens/MyPet";
import PetStack from "./PetStack";

export default function HomeStack(){
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator>

        <Stack.Screen
            name="MyPets"
            component={PetStack}
            options={{ headerShown: false }}/>
        </Stack.Navigator>

    );
}