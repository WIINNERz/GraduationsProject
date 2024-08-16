import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPet from '../screens/MyPet';
import AddPet from '../screens/AddPet';
import PetDetail from '../screens/PetDetail';

import PetProfile from '../screens/PetProfile';
import FindPet from '../screens/FindPet';
import ChatRoom from '../screens/ChatRoom';
import ChatRoom1 from '../screens/ChatRoom1';

const Stack = createNativeStackNavigator();

export default function PetStack() {
  return (
    <Stack.Navigator initialRouteName='FindPet'>
        <Stack.Screen
        name="FindPet"
        component={FindPet}
        options={{ headerShown: false}} />
      {/* <Stack.Screen
        name="MyPets"
        component={MyPet}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="PetProfile"
        component={PetProfile}
        options={{ headerShown: false }} />
      <Stack.Screen
        name="ChatRoom1"
        component={ChatRoom1}
        options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}
