import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';
import MessageList from '../components/MessageList';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {getRoomId} from '../utils/common';
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
import {auth, db, storage} from '../configs/firebaseConfig';
import PlusBoxChatRoom from '../components/PlusBoxChatRoom';
import E2EE from '../components/E2EE';


export default function ChatRoom1({navigation}) {
  const route = useRoute();
  const {uid, username, profileURL} = route.params;
  const user = auth.currentUser;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const textRef = useRef('');
  const inputRef = useRef(null);
  const [userProfile, setUserProfile] = useState({
    profileURL: '',
    senderName: '',
  });
  const [header, setHeader] = useState({username: '', photoURL: ''});
  const [isBoxed, setIsBoxed] = useState(false);
  const [selectedPets, setSelectedPets] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPetData, setSelectedPetData] = useState([]);
  const [telModalVisible, setTelModalVisible] = useState(false);
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [sharedSecret, setSharedSecret] = useState(null);
  const e2ee = E2EE();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'none'},
      });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: [styles.tabBar, {backgroundColor: '#F0DFC8'}],
        });
      };
    }, [navigation]),
  );

  useEffect(() => {
    if (user) {
      createRoomIfNotExists();
      fetchUserProfile();

      let roomId = getRoomId(user.uid, uid);
      const docRef = doc(db, 'Rooms', roomId);
      const messageRef = collection(docRef, 'Messages');
      const q = query(messageRef, orderBy('createdAt', 'asc'));

      let unsubscribe = onSnapshot(q, snapshot => {
        let allMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          let decryptedText = '';
          let decryptedTel = '';
          let decryptedLocation = '';
          let location = null;

          if (sharedSecret) {
            try {
              if (data.text) {
                decryptedText = e2ee.decryptMessage(sharedSecret, data.text, data.nonce);
              }
              if (data.telephoneNumber) {
                decryptedTel = e2ee.decryptMessage(sharedSecret, data.telephoneNumber, data.nonce);
              }
              if (data.location) {
                decryptedLocation = e2ee.decryptMessage(sharedSecret, data.location, data.nonce);
                location = JSON.parse(decryptedLocation);
              }
            } catch (error) {
              console.error('Decryption failed:', error);
            }
          }

          return { id: doc.id, ...data, text: decryptedText, telephoneNumber: decryptedTel , location : location};
        });
        setMessages([...allMessages]);
      });
      setRoomId(roomId);
      return unsubscribe;
    } else {
      console.error('User is not authenticated');
    }
  }, [user, sharedSecret]);

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
    
    }
  };

  const fetchOtherUserProfile = async otherUserId => {
    try {
      const userDocRef = doc(db, 'Users', otherUserId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setHeader({
          username: userData.username || '',
          photoURL: userData.photoURL || '',
        });
        const MySecretKey = await e2ee.getMySecretKey();
        const theirPublicKey = userData.publicKey;
        const sharedSecret = e2ee.computeSharedSecret(MySecretKey, theirPublicKey);
        setSharedSecret(sharedSecret);        
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
    if (!sharedSecret) {
      Alert.alert('Error', 'Shared secret not found');
      return;
    }
    const { cipherText, nonce } = e2ee.encryptMessage(sharedSecret, trimmedMessage);

    try {
      let roomId = getRoomId(user.uid, uid);
      const docRef = doc(db, 'Rooms', roomId);
      const messageRef = collection(docRef, 'Messages');
      textRef.current = '';
      let imageUrl = '';
      if (type === 'image') {
        const storageRef = ref(
          storage,
          `chat/${roomId}/${user.uid}/${Date.now()}`,
        );
        const response = await fetch(message);
        const blob = await response.blob();
        const snapshot = await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await setDoc(doc(messageRef), {
        userId: user?.uid,
        text: type === 'text' ? cipherText : '',
        nonce,
        profileURL: userProfile.profileURL,
        senderName: userProfile.senderName,
        imageUrl: type === 'image' ? imageUrl : '',
        readed: false,
        createdAt: Timestamp.fromDate(new Date()),
      });
      setMessage('');
      setSelectedPets({});
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  const handleSendLocation = async (location) => {
    try {
      let roomId = getRoomId(user.uid, uid);
      const docRef = doc(db, 'Rooms', roomId);
      const messageRef = collection(docRef, 'Messages');
      if (!sharedSecret) {
        Alert.alert('Error', 'Key not found');
        return;
      }
      console.log(' plain text Location:', location);
      const encrypted = e2ee.encryptMessage(sharedSecret, JSON.stringify(location));
      console.log('Encrypted Location:', encrypted);
      await setDoc(doc(messageRef), {
        userId: user?.uid,
        text: '',
        profileURL: userProfile.profileURL,
        senderName: userProfile.senderName,
        imageUrl: '',
        createdAt: Timestamp.fromDate(new Date()),
        location : encrypted.cipherText,
        nonce : encrypted.nonce,
      });
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };
  const handleImagePicked = url => {
    handleSendMessage(url, 'image');
  };

  const handleSendPets = async selectedPetData => {
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

  const handleSendTelephone = telephoneNumber => {
    setTelephoneNumber(telephoneNumber);
    setTelModalVisible(true);
  };

  const confirmSendTel = async () => {
    try {
      let roomId = getRoomId(user.uid, uid);
      const docRef = doc(db, 'Rooms', roomId);
      const messageRef = collection(docRef, 'Messages');
      if (!sharedSecret) {
        Alert.alert('Error', 'Key not found');
        return;
      }
      const encrypted = e2ee.encryptMessage(sharedSecret, telephoneNumber);
      const encTel = encrypted.cipherText;
      const telnonce = encrypted.nonce;
      await setDoc(doc(messageRef), {
        userId: user?.uid,
        text: '',
        profileURL: userProfile.profileURL,
        senderName: userProfile.senderName,
        imageUrl: '',
        createdAt: Timestamp.fromDate(new Date()),
        readed: false,
        selectedPets: '',
        telephoneNumber: encTel,
        nonce : telnonce,
      });
      setTelephoneNumber('');
      setTelModalVisible(false);
    } catch (error) {
      console.error('Error sending telephone number:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <ChatRoomHeader user={header} />
        <MessageList messages={messages} currentUser={user} roomId={roomId} />
      </View>
      {isBoxed && (
        <View style={styles.tabPlusBox}>
          <PlusBoxChatRoom
            onImagePicked={handleImagePicked}
            onSendPets={handleSendPets}
            onSendTelephone={handleSendTelephone}
            onSendLocation={handleSendLocation}
          />
        </View>
      )}
      <View style={styles.chatInput}>
        <TouchableOpacity
          style={{padding: 10}}
          onPress={() => setIsBoxed(!isBoxed)}>
          <MaterialCommunityIcons name="plus" size={30} color="#007bff" />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          placeholder="Type a message"
          value={message}
          onChangeText={value => setMessage(value)}
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={() => handleSendMessage(message)}
          style={styles.sendButton}>
          <MaterialCommunityIcons
            name="send-circle"
            size={30}
            color="#007bff"
          />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.title}>Confirm</Text>
            {selectedPetData.map((pet, index) => (
              <View
                key={index}
                style={{alignItems: 'center', marginVertical: 10}}>
                <View>
                  {pet.photoURL ? (
                    <Image
                      source={{uri: pet.photoURL}}
                      style={styles.petPic}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="dog"
                      size={80}
                      color="#E16539"
                    />
                  )}
                </View>
              </View>
            ))}
            <Text style={styles.modalText}>
              Do you want to send&nbsp; 
              {selectedPetData.map((pet, index) => (
                <Text key={index} style={styles.petText}>
                  {pet.name || pet.id}
                </Text>
              ))}
            </Text>
            <Text style={styles.modalText}>to the new owner?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonCancel,
                  {borderColor: '#EA4335', backgroundColor: '#EA4335'},
                ]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={[styles.textStyle, {color: '#fff'}]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonConfirm,
                  {borderColor: '#34A853', backgroundColor: '#34A853'},
                ]}
                onPress={confirmSendPets}>
                <Text style={[styles.textStyle, {color: '#fff'}]}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={telModalVisible}
        onRequestClose={() => {
          setTelModalVisible(!telModalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.title}>Confirm Telephone Number</Text>
            <Text style={styles.modalText}>
              Do you want to send your telephone number?
            </Text>
            <Text style={styles.modalText}> Your number is {telephoneNumber}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonCancel,
                  {borderColor: '#EA4335'},
                ]}
                onPress={() => setTelModalVisible(!telModalVisible)}>
                <Text style={[styles.textStyle, {color: '#EA4335'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonConfirm,
                  {borderColor: '#34A853'},
                ]}
                onPress={confirmSendTel}>
                <Text style={[styles.textStyle, {color: '#34A853'}]}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const modaltitle = windowWidth / 20;
const modaltext = windowWidth / 24;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
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
    height: '8%',
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
    backgroundColor: '#fff',
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
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    width: 100,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  buttonCancel: {
    backgroundColor: '#FFFFFF',
  },
  buttonConfirm: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: modaltitle,
    fontFamily: 'InterBold',
    color: 'red',
    marginBottom: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: modaltext,
    textAlign: 'center',
  },
  petPic : {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  petText: {
    color: '#E16539',
    fontFamily: 'InterBold',
  },
});
