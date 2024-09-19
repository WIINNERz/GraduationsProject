import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';
import MessageList from '../components/MessageList';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getRoomId } from '../utils/common';
import { setDoc, doc, Timestamp, collection, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db, storage } from '../configs/firebaseConfig';
import PlusBoxChatRoom from '../components/PlusBoxChatRoom';

export default function ChatRoom({navigation}) {
    const route = useRoute();
    const { params } = route.params;
    const user = auth.currentUser;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const textRef = useRef('');
    const inputRef = useRef(null);
    const [userProfile, setUserProfile] = useState({ profileURL: '', senderName: '' });
    const [isBoxed, setIsBoxed] = useState(false);

    useFocusEffect(
        useCallback(() => {
          navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'none' }
          });
    
          return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: [styles.tabBar, { backgroundColor:'#F0DFC8' }],
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
            const userDocRef = doc(db, 'Users', user.uid);
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

    const handleSendMessage = async (message, type = 'text') => {
        let trimmedMessage = message.trim();
        if (!trimmedMessage) return;
    
        try {
            let roomId = getRoomId(user.uid, params.uid);
            const docRef = doc(db, 'Rooms', roomId);
            const messageRef = collection(docRef, 'Messages');
            textRef.current = '';
            let imageUrl = '';
            let readed = false;
            if (type === 'image') {
                const storageRef = ref(storage, `chat/${roomId}/${user.uid}/${Date.now()}`);
                const response = await fetch(message);
                const blob = await response.blob();
                const snapshot = await uploadBytes(storageRef, blob);
                imageUrl = await getDownloadURL(snapshot.ref);
            }
            const messageData = {
                userId: user?.uid,
                text: type === 'text' ? trimmedMessage : '',
                profileURL: userProfile.profileURL,
                senderName: userProfile.senderName,
                imageUrl: type === 'image' ? imageUrl : '',
                createdAt: Timestamp.fromDate(new Date()),
                readed: false // Add this line
            };
            console.log('Message Data:', messageData); // Log the message data
            await setDoc(doc(messageRef), messageData);
            setMessage(''); 
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleImagePicked = (url) => {
        const filename = url.split('/').pop();
        textRef.current = filename;
        if (inputRef) inputRef.current?.setNativeProps({ text: filename });
        handleSendMessage(url, 'image'); 
    };

    return (
        <View style={styles.container}>
            <View style={styles.chatContainer}>
                <ChatRoomHeader user={params} />
                <MessageList messages={messages} currentUser={user} />
            </View>
            {isBoxed && (
            <View style={styles.tabPlusBox}>
                <PlusBoxChatRoom onImagePicked={handleImagePicked} />
            </View>
            )}
            <View style={styles.chatInput}>
                <TouchableOpacity style={{padding:10}} onPress={() => setIsBoxed(!isBoxed)}>
                    <MaterialCommunityIcons name='plus' size={30} color="#007bff"/>
                </TouchableOpacity>
                <TextInput
                    ref={inputRef}
                    placeholder='Type a message'
                    value={message}  
                    onChangeText={value => setMessage(value)}  
                    style={styles.textInput}
                />
                <TouchableOpacity onPress={() => handleSendMessage(message)} style={styles.sendButton}>
                    <MaterialCommunityIcons name="send-circle" size={30} color="#007bff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}    

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#f5f5f5',
    },
    chatContainer: {
        flex: 1,
        padding:20
    },
    chatInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#EDE6E6',
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
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
