import { View, Text, FlatList } from 'react-native';
import React from 'react';
import ChatItem from './ChatItem';
import { useNavigation } from '@react-navigation/native';

export default function ChatList({ rooms, users, currentUserId }) {
    const navigation = useNavigation();
    console.log(users);
    const userMap = users.reduce((map, user) => {
        map[user.uid] = user;
        return map;
    }, {});

    return (
        <View>
            <FlatList
                data={rooms}
                contentContainerStyle={{ padding: 20 }}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const [userId1, userId2] = item.roomId.split('_');
                    const otherUserId = userId1 === currentUserId ? userId2 : userId1;
                    const otherUser = userMap[otherUserId];

                    return (
                        <ChatItem
                            item={otherUser}
                            navigation={navigation}
                        />
                    );
                }}
            />
        </View>
    );
}