// src/stacks/WaitVerifyStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WaitVerify from '../screens/WaitVerify'; // Import the WaitVerify screen

const Stack = createStackNavigator();

const WaitVerifyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WaitVerify" component={WaitVerify} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default WaitVerifyStack;