import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPet from '../screens/MyPet';
import AddPet from '../screens/AddPet';
import PetDetail from '../screens/PetDetail';
import Home from '../screens/Home';
import PetProfile from '../screens/PetProfile';

const Stack = createNativeStackNavigator();

export default function PetStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="MyPets"
        component={MyPet}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPet"
        component={AddPet}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetail}
        options={{ headerShown: false }} />
      <Stack.Screen
        name="PetProfile"
        component={PetProfile}
        options={{ headerShown: false }} />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
