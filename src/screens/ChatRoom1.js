import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
  } from 'react-native';
  import React, { useCallback, useEffect, useRef, useState } from 'react';
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  import { useFocusEffect, useRoute } from '@react-navigation/native';
  import ChatRoomHeader from '../components/ChatRoomHeader';
  import MessageList from '../components/MessageList';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { getRoomId } from '../utils/common';
  import {
    setDoc,
    doc,
    Timestamp,
    collection,
    getDoc,
    query,
    orderBy,
    onSnapshot,
  } from 'firebase/firestore';
  import { auth, db, storage } from '../configs/firebaseConfig';
  import PlusBoxChatRoom from '../components/PlusBoxChatRoom';
  
  export default function ChatRoom1({ navigation }) {
    const route = useRoute();
    const { uid, username, profileURL } = route.params;
    const user = auth.currentUser;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const textRef = useRef('');
    const inputRef = useRef(null);
    const [userProfile, setUserProfile] = useState({ profileURL: '', senderName: '' });
    const [header, setHeader] = useState({ username: '', photoURL: '' });
    const [isBoxed, setIsBoxed] = useState(false);
    const [selectedPets, setSelectedPets] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPetData, setSelectedPetData] = useState([]);
  
    useFocusEffect(
      useCallback(() => {
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'none' },
        });
  
        return () => {
          navigation.getParent()?.setOptions({
            tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }], // Reset tabBarStyle to default
          });
        };
      }, [navigation])
    );
  
    useEffect(() => {
      if (user) {
        createRoomIfNotExists();
        fetchUserProfile();
  
        let roomId = getRoomId(user.uid, uid);
        const docRef = doc(db, 'Rooms', roomId);
        const messageRef = collection(docRef, 'Messages');
        const q = query(messageRef, orderBy('createdAt', 'asc'));
  
        let unsubscribe = onSnapshot(q, (snapshot) => {
          let allMessages = snapshot.docs.map((doc) => {
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
      let roomId = getRoomId(user.uid, uid);
      const roomRef = doc(db, 'Rooms', roomId);
  
      const roomDoc = await getDoc(roomRef);
      if (!roomDoc.exists()) {
        const createdAt = Timestamp.fromDate(new Date());
        await setDoc(roomRef, {
          roomId,
          createdAt,
        });
      } else {
        // console.log('Room already exists with ID:', roomId);
      }
    };
  
    const fetchOtherUserProfile = async (otherUserId) => {
      try {
        const userDocRef = doc(db, 'Users', otherUserId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setHeader({
            username: userData.username || '',
            photoURL: userData.photoURL || '',
          });
        }
      } catch (error) {
        console.error('Error fetching other user profile:', error);
      }
    };
  
    useEffect(() => {
      const otherUserId = uid;
      fetchOtherUserProfile(otherUserId);
    }, [uid]);
  
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
      if (!trimmedMessage && type === 'text') return;
  
      try {
        let roomId = getRoomId(user.uid, uid);
        const docRef = doc(db, 'Rooms', roomId);
        const messageRef = collection(docRef, 'Messages');
        textRef.current = '';
        let imageUrl = '';
        if (type === 'image') {
          const storageRef = ref(storage, `chat/${roomId}/${user.uid}/${Date.now()}`);
          const response = await fetch(message);
          const blob = await response.blob();
          const snapshot = await uploadBytes(storageRef, blob);
          imageUrl = await getDownloadURL(snapshot.ref);
        }
    
        await setDoc(doc(messageRef), {
          userId: user?.uid,
          text: type === 'text' ? trimmedMessage : '',
          profileURL: userProfile.profileURL,
          senderName: userProfile.senderName,
          imageUrl: type === 'image' ? imageUrl : '',
          createdAt: Timestamp.fromDate(new Date()),
        });
        setMessage('');
        setSelectedPets({});
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
  
    const handleSendPets = async (selectedPetData) => {
        if (selectedPetData.length === 0) return;

        setSelectedPetData(selectedPetData);
        setModalVisible(true);
        console.log('Selected pets:', selectedPetData);
    };

    const confirmSendPets = async () => {
        try {
            let roomId = getRoomId(user.uid, uid);
            const docRef = doc(db, 'Rooms', roomId);
            const messageRef = collection(docRef, 'Messages');

            await setDoc(doc(messageRef), {
                userId: user?.uid,
                text: '',
                profileURL: userProfile.profileURL,
                senderName: userProfile.senderName,
                imageUrl: '',
                createdAt: Timestamp.fromDate(new Date()),
                selectedPets: selectedPetData,
            });
            setSelectedPets({});
            setModalVisible(false);
        } catch (error) {
            console.error('Error sending pet data:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.chatContainer}>
                <ChatRoomHeader user={header} />
                <MessageList messages={messages} currentUser={user} />
            </View>
            {isBoxed && (
                <View style={styles.tabPlusBox}>
                    <PlusBoxChatRoom onImagePicked={handleImagePicked} onSendPets={handleSendPets} />
                </View>
            )}
            <View style={styles.chatInput}>
                <TouchableOpacity style={{ padding: 10 }} onPress={() => setIsBoxed(!isBoxed)}>
                    <MaterialCommunityIcons name='plus' size={30} color="#007bff" />
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.title}>Warning</Text>
                    <Text style={styles.modalText}>
                            Do you want to send 
                        </Text>
                        {selectedPetData.map((pet, index) => (
                            <Text key={index} style={styles.petText}>
                                {pet.name || pet.id}
                            </Text>
                        ))}
                        <Text style={styles.modalText}>to the new owner?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel,{borderColor:'#EA4335'}]}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                               <Text style={[styles.textStyle, { color: '#EA4335' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonConfirm,{borderColor:'#34A853'}]}
                                onPress={confirmSendPets}
                            >
                                <Text style={[styles.textStyle, { color: '#34A853' }]}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        padding: 20
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#F0DFC8',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    button: {
        width:100,
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 20,
        borderWidth:1,
    },
    buttonCancel: {
        backgroundColor: '#FFFFFF',
    },
    buttonConfirm: {
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});