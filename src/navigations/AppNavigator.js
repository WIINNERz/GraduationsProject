import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Home from '../screens/Home';
import ProfileStack from '../screens/ProfileStack';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
