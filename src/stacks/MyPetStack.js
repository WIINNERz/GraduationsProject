import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyPet from '../screens/MyPet';
import AddPet from '../screens/AddPet';
import PetDetail from '../screens/PetDetail';
import MyPetProfile from '../screens/MyPetProfile';
import Home from '../screens/Home';
import Location1 from '../screens/Location1';

const Stack = createNativeStackNavigator();

export default function MyPetStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MyPets"
        component={MyPet}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddPet"
        component={AddPet}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MyPetProfile"
        component={MyPetProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Location1"
        component={Location1}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
