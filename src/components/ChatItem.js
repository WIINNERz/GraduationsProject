import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, getDocs, query, where, writeBatch, onSnapshot } from 'firebase/firestore';
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
        let unsubscribe;

        const fetchUnreadMessages = () => {
            if (roomId) {
                try {
                    const messagesRef = collection(db, 'Rooms', roomId, 'Messages');
                    const q = query(
                        messagesRef,
                        where('readed', '==', false),
                        where('userId', '!=', currentUser.uid)
                    );

                    unsubscribe = onSnapshot(q, (querySnapshot) => {
                        console.log(`Unread messages count (excluding current user): ${querySnapshot.size}`);
                        setUnreadCount(querySnapshot.size);
                    });
                } catch (error) {
                    console.error("Error fetching unread messages: ", error);
                }
            }
        };

        fetchUnreadMessages();

        // Clean up the listener on component unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [roomId, currentUser.uid]);

    if (!item || !item.photoURL) {
        return null;
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.container}>
                <Image source={{ uri: item.photoURL }} style={styles.image} />
                <View style={styles.textContainer}>
                    <View>
                        <Text style={styles.username}>{item.username}</Text>
                        {latestMessage && (
                            <Text style={styles.latestMessage}>
                                {latestMessage.userId === currentUser.uid ? 'You: ' : ''}
                                {renderLatestMessage()}
                            </Text>
                        )}
                    </View>
                    {unreadCount > 0 &&
                        <MaterialCommunityIcons name="circle" size={20} color="#D27C2C" style={styles.icon} />
                    }
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderRadius:20,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 20,
        elevation: 10, 
    },
    
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    textContainer: {
        marginLeft: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    username: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    latestMessage: {
        color: 'gray',
    },
    icon: {
        marginLeft: 'auto',
    },
});

export default ChatItem;