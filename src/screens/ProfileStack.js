import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profiles from '../components/Profiles';
import SignIn from '../components/SignIn';
import ProfileDetail from '../components/ProfileDetail';


const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Group>
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
      </Stack.Group>
      <Stack.Group screenOptions={{ animation:'slide_from_bottom'}}>
        <Stack.Screen
          name="ProfileDetail"
          component={ProfileDetail}
          options={{headerShown: false}}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
