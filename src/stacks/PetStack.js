import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetProfile from '../screens/PetProfile';
import FindPet from '../screens/FindPet';
import ChatRoom1 from '../screens/ChatRoom1';
import OtherUser from '../screens/OtherUser';

const Stack = createNativeStackNavigator();

export default function PetStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen
        name="OtherUser"
        component={OtherUser}
        options={{
          tabBarStyle: { display: 'none' }
        }} />
    </Stack.Navigator>
  );
}
