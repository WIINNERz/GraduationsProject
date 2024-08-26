import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';
import MessageList from '../components/MessageList';
import useAuth from '../hooks/useAuth';
import { getRoomId } from '../utils/common';
import { setDoc, doc, Timestamp, collection, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore'; // ตรวจสอบให้แน่ใจว่าได้ทำการนำเข้า
import { auth, db } from '../configs/firebaseConfig';

export default function ChatRoom({navigation}) {
    const route = useRoute();
    const { params } = route.params;
    const user = auth.currentUser;
    const [messages, setMessages] = useState([]);
    const textRef = useRef('');
    const inputRef = useRef(null);
    const [userProfile, setUserProfile] = useState({ profileURL: '', senderName: '' }); // State to hold user profile data
    useFocusEffect(
        useCallback(() => {
          navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'none' }
          });
    
          return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: [styles.tabBar, { backgroundColor:'#F0DFC8' }],// Reset tabBarStyle to default
            });
          };
        }, [navigation])
      );
    useEffect(() => {
        if (user) {
            createRoomIfNotExists();
            fetchUserProfile();

            let roomId = getRoomId(user.uid, params.uid);
            const docRef = doc(db, 'Rooms', roomId);
            const messageRef = collection(docRef, 'Messages');
            const q = query(messageRef, orderBy('createdAt', 'asc'));

            let unsubscribe = onSnapshot(q, (snapshot) => {
                let allMessages = snapshot.docs.map(doc => {
                    return doc.data();
                });
                setMessages([...allMessages]);
            });
            return unsubscribe;
        } else {
            console.error('User is not authenticated');
        }
    }, [user]);
    const createRoomIfNotExists = async () => {
        let roomId = getRoomId(user.uid, params.uid);
        await setDoc(doc(db, 'Rooms', roomId), {
            roomId,
            createdAt: Timestamp.fromDate(new Date()),
        });
    }
    const fetchUserProfile = async () => {
        try {
            const userDocRef = doc(db, 'Users', params.uid); // Get the user document
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserProfile({
                    profileURL: userData.photoURL || '',
                    senderName: userData.username || '',
                });
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };
    const handleSendMessage = async () => {
        let message = textRef.current.trim();
        if (!message) return;
        try {
            let roomId = getRoomId(user.uid, params.uid);
            const docRef = doc(db, 'Rooms', roomId);
            const messageRef = collection(docRef, 'Messages');
            textRef.current = '';
            if(inputRef) inputRef?.current?.clear();
            const newDoc = await setDoc(doc(messageRef), {
                userId: user?.uid,
                text: message,
                profileURL: userProfile.profileURL, // Use fetched profile URL
                senderName: userProfile.senderName,
                createdAt: Timestamp.fromDate(new Date()),
            });
            console.log('new message id :', newDoc);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    return (
        <View style={styles.container}>
            <View style={styles.chatContainer}>
            <ChatRoomHeader user={params} />
            <MessageList messages={messages} currentUser={user} />
            </View>

            <View style={styles.chatInput}>
                <TouchableOpacity style={{padding:10}}>
                    <MaterialCommunityIcons name='plus' size={30} color="#007bff"/>
                </TouchableOpacity>
                <TextInput
                    ref={inputRef}
                    placeholder='Type a message'
                    onChangeText={value => textRef.current = value}
                    style={styles.textInput} // Apply the new text input style
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                    <MaterialCommunityIcons name="send-circle" size={30} color="#007bff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}    

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end', // Align items to the bottom
        backgroundColor: '#f5f5f5', // Light background color
    },
    chatContainer: {
        flex: 1,
        padding:20
    },
    chatInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2, // Add a shadow effect for better visibility
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    sendButton: {
        padding: 10,
        marginLeft: 10,
    },
    tabBar: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "8%", 
        position: 'absolute',
        overflow: 'hidden',
      },
});

