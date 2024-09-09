import {View, Text, StyleSheet, Image, TouchableOpacity , Alert} from 'react-native';
import React, {memo, useEffect, useState, useMemo} from 'react';
import {getFirestore , doc, updateDoc, getDoc} from 'firebase/firestore';
import {auth, firestore} from '../configs/firebaseConfig';
import {useNavigation} from '@react-navigation/native';
const MessageItem = ({message, currentUser, roomId, messageId}) => {
  const [adoptedPets, setAdoptedPets] = useState({});
  const navigate = useNavigation();
  const {
    userId,
    profileURL = '',
    text = '',
    imageUrl = '',
    createdAt,
    senderName = '',
    selectedPets = [],
    adopted = false,
  } = message || {};

  const isCurrentUser = userId === currentUser?.uid;
  const formattedCreatedAt = useMemo(
    () => createdAt?.toDate().toLocaleTimeString() || '',
    [createdAt],
  );
  

  const isVerified = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(firestore, 'Users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const verified = userDoc.data().verify;
      if (verified === true) {
        return true;
      }
    }
    return false;
  };

  const handleAdopt = async (petId, petUid, messageId, roomId) => {
    if (!petId || !petUid || !messageId || !roomId) {
      console.error('Missing required parameters:', {
        petId,
        petUid,
        messageId,
        roomId,
      });
      return;
    }

    if (petUid === currentUser.uid) {
      console.log('uid same');
      return;
    }

    const userVerify = await isVerified();
    if (!userVerify)  {
      Alert.alert(
        'Your account has not been verified',
        'Please verify your account to adopt this pet',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Go Verify',
            onPress: () => navigate.navigate('Verify'),
          },
        ],
        {cancelable: false},
      );
      console.log('User not verified');
      return;
    }

    try {
      const db = getFirestore();
      const petDoc = doc(db, 'Pets', petId);
      const messageDoc = doc(db, 'Rooms', roomId, 'Messages', messageId);

      // Check if the pet is already adopted
      const messageSnapshot = await getDoc(messageDoc);
      if (!messageSnapshot.exists()) {
        console.log('Message document does not exist');
        return;
      }

      const messageData = messageSnapshot.data();
      if (messageData && messageData.adopted) {
        console.log('Pet already adopted');
        return;
      }

      await updateDoc(petDoc, {
        uid: currentUser.uid,
        status: 'have_owner',
      });

      await updateDoc(messageDoc, {
        adopted: true,
      });

      setAdoptedPets(prev => ({...prev, [petId]: true}));
      console.log('Pet adopted successfully');
    } catch (error) {
      console.error('Error adopting pet: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUser : styles.otherUser,
        ]}>
        {!isCurrentUser && profileURL && (
          <Image source={{uri: profileURL}} style={styles.profileImage} />
        )}
        <View style={styles.messageContent}>
          {imageUrl ? (
            <Image source={{uri: imageUrl}} style={styles.messageImage} />
          ) : (
            <Text style={styles.messageText}>{text}</Text>
          )}
          {selectedPets.length > 0 && (
            <View style={styles.petsContainer}>
              {selectedPets.map((pet, index) => (
                <View key={index} style={styles.petItem}>
                  <Image source={{uri: pet.photoURL}} style={styles.petImage} />
                  <Text style={styles.petName}>
                    {senderName} wants to pass {pet.name} to you for further
                    care.
                  </Text>
                  {!isCurrentUser && (
                    <TouchableOpacity
                      style={[
                        styles.adoptButton,
                        (adoptedPets[pet.id] || adopted) &&
                          styles.adoptedButton,
                      ]}
                      onPress={() =>
                        handleAdopt(pet.id, pet.uid, messageId, roomId)
                      }
                      disabled={adoptedPets[pet.id] || adopted}>
                      <Text style={styles.buttonText}>
                        {adoptedPets[pet.id] || adopted ? 'Adopted' : 'Adopt'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
          <Text style={styles.timestamp}>{formattedCreatedAt}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  currentUser: {
    justifyContent: 'flex-end',
  },
  otherUser: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  petsContainer: {
    width: '100%',
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
  },
  petItem: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  petName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  adoptButton: {
    width: 200,
    padding: 10,
    backgroundColor: '#D27C2C',
    borderRadius: 5,
    margin: 10,
    marginBottom:0,
  },
  adoptedButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default memo(MessageItem);
