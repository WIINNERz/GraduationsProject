import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profiles from '../components/Profiles';
import SignIn from '../components/SignIn';
import ProfileDetail from '../components/ProfileDetail';
import MyAccount from '../components/MyAccount';4
import AccountInfo from '../components/AccountInfo';


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
        <Stack.Screen
          name="MyAccount"
          component={MyAccount}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountInfo"
          component={AccountInfo}
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
