import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profiles from '../components/Profiles';
import SignIn from '../components/SignIn';


const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Profiles" 
        component={Profiles} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="SignIn" 
        component={SignIn} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
