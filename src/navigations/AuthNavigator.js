import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from '../screens/AuthStack';
import Home from '../components/Home';
import ProfileStack from '../screens/ProfileStack';
import Forgot from '../components/Forgot';
import HomeStack from '../screens/HomeStack';

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
