import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from '../stacks/AuthStack';
import ProfileStack from '../stacks/ProfileStack';
import Forgot from '../screens/Forgot';
import HomeStack from '../stacks/HomeStack';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Auth" 
        component={AuthStack} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
        />
      <Stack.Screen 
        name="Forgot" 
        component={Forgot} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
