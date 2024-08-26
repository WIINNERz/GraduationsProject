import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';
import MessageList from '../components/MessageList';
import { getRoomId } from '../utils/common';
import { setDoc, doc, Timestamp, collection, getDoc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../configs/firebaseConfig';

export default function ChatRoom({navigation}) {
    const route = useRoute();
    const { id } = route.params;
    const { params } = route.params;
    const user = auth.currentUser;
    const [messages, setMessages] = useState([]);
    const textRef = useRef('');
    const inputRef = useRef(null);
    const [userProfile, setUserProfile] = useState({ profileURL: '', senderName: '' });

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' }
            });

            return () => {
                navigation.getParent()?.setOptions({
                    tabBarStyle: undefined
                });
            };
        }, [navigation])
    );

    useEffect(() => {
        if (user) {
            createRoomIfNotExists();
            fetchPetUserProfile();
            
            let roomId = getRoomId(user.uid, id.uid);
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
        try {
            // ดึงค่า `uid` จากเอกสารใน `Pets`
            const petRef = doc(db, 'Pets', id);
            const petDoc = await getDoc(petRef);
            if (petDoc.exists()) {
                const petData = petDoc.data();
                const petUid = petData.uid;

                if (petUid) {
                    // ตรวจสอบว่ามีเอกสารใน `Rooms` ที่มี `uid` ตรงกับ `petUid` หรือไม่
                    const roomsRef = collection(db, 'Rooms');
                    const q = query(roomsRef, where('uid', '==', petUid));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        // ถ้าไม่มีห้องที่ตรงกับ `petUid`, สร้างห้องใหม่
                        let roomId = getRoomId(user.uid, petUid);
                        const newRoomRef = doc(db, 'Rooms', roomId);
                        await setDoc(newRoomRef, {
                            roomId,
                            uid: petUid,
                            createdAt: Timestamp.fromDate(new Date()),
                            // เพิ่มฟิลด์อื่นๆ ที่ต้องการที่นี่
                        });
                        console.log('New room created with ID:', roomId);
                    } else {
                        console.log('Room(s) already exist for the pet UID');
                    }
                } else {
                    console.error('Pet UID is undefined or null');
                }
            } else {
                console.error('Pet document does not exist');
            }
        } catch (error) {
            console.error('Error creating room if not exists:', error);
        }
    };

    const fetchPetUserProfile = async () => {
        try {
            const userPetRef = doc(db, 'Pets', id); // Use id directly
            const userPetDoc = await getDoc(userPetRef);
            if (userPetDoc.exists()) {
                const petData = userPetDoc.data();
                setUserProfile({
                    profileURL: petData.photoURL || '',
                    senderName: petData.username || '',
                });
                console.log('Pet data:', petData);
            } else {
                console.error('Pet document does not exist');
            }
        } catch (error) {
            console.error('Error fetching pet user profile:', error);
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
            if (inputRef) inputRef.current?.clear();
            const newDoc = await setDoc(doc(messageRef), {
                userId: user?.uid,
                text: message,
                profileURL: userProfile.profileURL, // Use fetched profile URL
                senderName: userProfile.senderName,
                createdAt: Timestamp.fromDate(new Date()),
            });
            console.log('New message id:', newDoc.id);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.chatContainer}>
                <ChatRoomHeader user={params} />
                <MessageList messages={messages} currentUser={user} />
            </View>

            <View style={styles.chatInput}>
                <TouchableOpacity style={{ padding: 10 }}>
                    <MaterialCommunityIcons name='plus' size={30} color="#007bff" />
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
        padding: 20,
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
});
