import { View, Text, FlatList } from 'react-native'
import React from 'react'
import ChatItem from './ChatItem'
import { useNavigation } from '@react-navigation/native';

export default function ChatList({ users }) {
    const navigation = useNavigation();
    return (
        <View>
            <FlatList
                data={users}
                contentContainerStyle={{ padding: 20 }}
                keyExtractor={item => Math.random()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) =>
                    <ChatItem
                        noBorder={index + 1 === users.length}
                        item={item}
                        index={index}
                        navigation={navigation}
                    />}
            />
        </View>
    )
}