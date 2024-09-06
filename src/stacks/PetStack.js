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
    <Stack.Navigator initialRouteName='FindPet' screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="FindPet"
        component={FindPet} />
      <Stack.Screen
        name="PetProfile"
        component={PetProfile} />
      <Stack.Screen
        name="ChatRoom1"
        component={ChatRoom1}
        options={{
          tabBarStyle: { display: 'none' }
        }} />
    </Stack.Navigator>
  );
}
