import { View, Text, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import MessageList from '../components/MessageList';
import ChatRoomHeader from '../components/ChatRoomHeader'; // Make sure this import is correct

export default function ChatRoom() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const [messages, setMessages] = useState([]);

    // Example useEffect to load messages (update with actual logic)
    useEffect(() => {
        // Load messages based on params or other logic
        // setMessages([...]);
    }, [params]);

    return (
        <View style={styles.container}>
            <ChatRoomHeader user={params} />
            <View style={styles.messageList}>
                <MessageList messages={messages} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageList: {
        flex: 1,
    },
});
