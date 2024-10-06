// src/stacks/WaitVerifyStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TermOfService from '../screens/TermOfSer';

const Stack = createStackNavigator();

const TermStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="TermOfService" component={TermOfService} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default TermStack;