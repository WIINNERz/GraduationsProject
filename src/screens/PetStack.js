import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPet from '../components/MyPet';
import AddPet from '../components/AddPet';


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
    </Stack.Navigator>
  );
}
