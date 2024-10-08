import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Profiles from '../screens/Profiles';
import SignIn from '../screens/SignIn';
import ProfileDetail from '../screens/ProfileDetail';
import AccountInfo from '../screens/AccountInfo';
import MyPet from '../screens/MyPet';
import Verify from '../screens/Verify';
import Settings from '../screens/Settings';
import ChangePassword from '../screens/ChangePassword';
import Policy from '../screens/Policy';
import Recovery from '../screens/Recovery';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="Profiles"
          component={Profiles}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AccountInfo"
          component={AccountInfo}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MyPet"
          component={MyPet}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Policy"
          component={Policy}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Recovery"
          component={Recovery}
          options={{headerShown: false}}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{animation: 'slide_from_bottom'}}>
        <Stack.Screen
          name="ProfileDetail"
          component={ProfileDetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{headerShown: false}}
        />
      </Stack.Group>
      <Stack.Screen
        name="Verify"
        component={Verify}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
