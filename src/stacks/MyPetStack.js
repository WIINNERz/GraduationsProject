import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPet from '../screens/MyPet';
import AddPet from '../screens/AddPet';
import PetDetail from '../screens/PetDetail';

const Stack = createNativeStackNavigator();

export default function MyPetStack() {
  return (
    <Stack.Navigator initialRouteName='MyPet'>

      <Stack.Screen
        name="MyPets"
        component={MyPet}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetail}
        options={{ headerShown: false }} />
      <Stack.Screen
        name="AddPet"
        component={AddPet}
        options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}
