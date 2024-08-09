import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Chat from '../screens/Chat';
import ChatRoom from '../screens/ChatRoom';
import ChatList from '../components/ChatList';
import ChatItem from '../components/ChatItem';

export default function ChatStack() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Chat'>
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="ChatList" component={ChatList} />
      <Stack.Screen name="ChatItem" component={ChatItem} /> 
    </Stack.Navigator>
  )
}