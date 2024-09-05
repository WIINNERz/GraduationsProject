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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatScreen" component={Chat} />
      <Stack.Screen name="ChatRoomScreen" component={ChatRoom} options={{ tabBarStyle: { display: 'none' } }}  />
      <Stack.Screen name="ChatListScreen" component={ChatList} />
      <Stack.Screen name="ChatItemScreen" component={ChatItem} /> 
    </Stack.Navigator>
  )
}