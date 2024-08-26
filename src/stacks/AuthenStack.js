import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import WaitVerify from '../screens/WaitVerify';


const Stack = createNativeStackNavigator();
export default function AuthenStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen name="AuthStack" component={AuthStack} options={{ headerShown: false }} />
        <Stack.Screen name="WaitVerify" component={WaitVerify} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}