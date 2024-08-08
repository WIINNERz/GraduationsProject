import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function ChatRoomHeader({ user, router }) {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                options={{
                    title: '', 
                    headerShadowVisible: false, 
                    headerLeft: () => (
                        <View>
                            <Text>Back</Text>
                        </View>
                    ),
                }}
            />
        </Stack.Navigator>

    )
}