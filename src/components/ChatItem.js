import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where,writeBatch } from 'firebase/firestore';
import { db } from '../configs/firebaseConfig';

const ChatItem = React.memo(({ item, latestMessage, roomId }) => {
    const navigation = useNavigation();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const [unreadCount, setUnreadCount] = useState(0);

    const handlePress = useCallback(async () => {
        try {
            navigation.navigate('ChatRoomScreen', {
                uid: item.uid,
                username: item.username,
                photoURL: item.photoURL,
            });

            if (roomId) {
                const messagesRef = collection(db, 'Rooms', roomId, 'Messages');
                const q = query(
                    messagesRef,
                    where('userId', '!=', currentUser.uid)
                );

                const querySnapshot = await getDocs(q);
                const batch = writeBatch(db);

                querySnapshot.forEach((doc) => {
                    const messageDocRef = doc.ref;
                    batch.update(messageDocRef, { readed: true });
                });

                await batch.commit();
                console.log('Successfully updated readed field for all messages');
            } else {
                console.error("roomId is missing.");
            }
        } catch (error) {
            console.error("Error updating readed field: ", error);
        }
    }, [item, roomId, currentUser.uid]);

    const renderLatestMessage = useCallback(() => {
        if (!latestMessage) return 'No messages yet';

        if (latestMessage.text === "") {
            if (Array.isArray(latestMessage.selectedPets) && latestMessage.selectedPets.length > 0) {
                return `Send Pet : ${latestMessage.selectedPets.map(pet => pet.name).join(', ')}`;
            } else if (latestMessage.imageURL) {
                return `Image : ${latestMessage.imageURL}`;
            } else {
                return "No content";
            }
        } else {
            return latestMessage.text;
        }
    }, [latestMessage]);

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            if (roomId) {
                try {
                    const messagesRef = collection(db, 'Rooms', roomId, 'Messages');
                    const q = query(
                        messagesRef,
                        where('readed', 'in', [false, null]),
                        where('userId', '!=', currentUser.uid)
                    );

                    const querySnapshot = await getDocs(q);
                    console.log(`Unread messages count (excluding current user): ${querySnapshot.size}`);
                    setUnreadCount(querySnapshot.size);
                } catch (error) {
                    console.error("Error fetching unread messages: ", error);
                }
            }
        };

        fetchUnreadMessages();
    }, [roomId, currentUser.uid]);

    if (!item || !item.photoURL) {
        return null;
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0, 0, 0, 0.2)' }}>
                <Image source={{ uri: item.photoURL }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <View style={{ marginLeft: 10 }}>
                    <Text>{item.username}</Text>
                    {latestMessage && (
                        <Text style={{ color: 'gray' }}>
                            {latestMessage.userId === currentUser.uid ? 'You: ' : ''}
                            {renderLatestMessage()}
                        </Text>
                    )}
                    <Text style={{ color: unreadCount > 0 ? 'red' : 'gray' }}>
                        {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default ChatItem;
