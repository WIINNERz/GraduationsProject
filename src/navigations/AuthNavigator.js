import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from '../stacks/AuthStack';
import ProfileStack from '../stacks/ProfileStack';
import Forgot from '../screens/Forgot';
import HomeStack from '../stacks/HomeStack';
import WaitVerify from '../screens/WaitVerify';
import MyPetStack from '../stacks/MyPetStack';
import AuthenStack from '../stacks/AuthenStack';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Auth" 
        component={AuthenStack} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Forgot" 
        component={Forgot} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="MyPets" 
        component={MyPetStack} 
        options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
