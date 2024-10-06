// src/stacks/WaitVerifyStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WaitVerify from '../screens/WaitVerify'; // Import the WaitVerify screen
import MyPetStack from './MyPetStack';
import TermOfService from '../screens/TermOfSer';

const Stack = createStackNavigator();

const WaitVerifyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WaitVerify" component={WaitVerify} options={{ headerShown: false }} />
      <Stack.Screen name="TermOfService" component={TermOfService} options={{ headerShown: false }} />
      <Stack.Screen name="MyPetStack" component={MyPetStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default WaitVerifyStack;