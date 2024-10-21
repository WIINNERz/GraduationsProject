import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import React, { memo, useEffect, useState, useMemo } from 'react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../configs/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Keymanagement from './Keymanagement';
import FullScreenModal from './FullScreenModal';

const MessageItem = ({ message, currentUser, roomId, messageId }) => {
  const [adoptedPets, setAdoptedPets] = useState({});
  const navigate = useNavigation();
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const KeymanagementInstance = Keymanagement();
  const {
    userId,
    profileURL = '',
    text = '',
    imageUrl = '',
    createdAt,
    senderName = '',
    selectedPets = [],
    adopted = false,
    telephoneNumber = '',
    location = null,
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
      return userDoc.data().verify === true;
    }
    return false;
  };
  const fetchPet = async id => {
    try {
      const petDoc = await getDoc(doc(firestore, 'Pets', id));
      if (petDoc.exists()) {
        const petData = { id: petDoc.id, ...petDoc.data() };
        const KeymanagementInstance = Keymanagement();
        try {
          const encryptedPetData = {
            gender: petData.gender
              ? await KeymanagementInstance.encryptData(petData.gender)
              : null,
            birthday: petData.birthday
              ? await KeymanagementInstance.encryptData(petData.birthday)
              : null,
            height: petData.height
              ? await KeymanagementInstance.encryptData(
                petData.height.toString(),
              )
              : null,
            age: petData.age
              ? await KeymanagementInstance.encryptData(petData.age.toString())
              : null,
            breeds: petData.breeds
              ? await KeymanagementInstance.encryptData(petData.breeds)
              : null,
            characteristics: petData.characteristics
              ? await KeymanagementInstance.encryptData(petData.characteristics)
              : null,
            chronic: petData.chronic
              ? await KeymanagementInstance.encryptData(petData.chronic)
              : null,
            color: petData.color
              ? await KeymanagementInstance.encryptData(petData.color)
              : null,
            weight: petData.weight
              ? await KeymanagementInstance.encryptData(
                petData.weight.toString(),
              )
              : null,
          };
          return encryptedPetData;
        } catch (err) {
          console.error('Error encrypting pet data:', err);
          // return {};
        }
      } else {
        console.error('Pet not found');
        // return {};
      }
    } catch (err) {
      console.error('Error fetching pet data:', err);
      // return {};
    }
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
    if (!userVerify) {
      Alert.alert(
        'Your account has not been verified',
        'Please verify your account to adopt this pet',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go Verify', onPress: () => navigate.navigate('Verify') },
        ],
        { cancelable: false },
      );
      console.log('User not verified');
      return;
    }

    try {
      const db = getFirestore();
      const petDoc = doc(db, 'Pets', petId);
      const encpet = await fetchPet(petId);
      const messageDoc = doc(db, 'Rooms', roomId, 'Messages', messageId);
      const newUserDoc = doc(db, 'Users', currentUser.uid);
      const userDoc = await getDoc(newUserDoc);
      if (!userDoc.exists()) {
        console.error('User data not found');
        return;
      }
      const userData = userDoc.data();
      const username = userData.username;
      const messageSnapshot = await getDoc(messageDoc);
      if (!messageSnapshot.exists() || messageSnapshot.data().adopted) {
        console.log('Pet already adopted or message does not exist');
        return;
      }

      await updateDoc(petDoc, {
        uid: currentUser.uid,
        favorite: false,
        username: username,
        status: 'have_owner',
        gender: encpet.gender,
        birthday: encpet.birthday,
        height: encpet.height,
        age: encpet.age,
        breeds: encpet.breeds,
        characteristics: encpet.characteristics,
        chronic: encpet.chronic,
        color: encpet.color,
        weight: encpet.weight,
      });

      await updateDoc(messageDoc, {
        adopted: true,
      });

      setAdoptedPets(prev => ({ ...prev, [petId]: true }));
      console.log('Pet adopted successfully');
    } catch (error) {
      console.error('Error adopting pet: ', error);
    }
  };

  const handleCall = telephoneNumber => {
    Linking.openURL(`tel:${telephoneNumber}`);
    console.log('Calling', telephoneNumber);
  };

  const PetItem = ({ pet }) => (
    <View style={styles.petItem}>
      {pet.photoURL ? (
        <Image source={{ uri: pet.photoURL }} style={styles.petImage} />
      ) : (
      <MaterialCommunityIcons name="dog" size={50} color="#E16539" />
       )}
      <Text style={styles.petName}>
        {senderName} wants to sent {pet.name} to you for further care.
      </Text>
      {!isCurrentUser && (
        <TouchableOpacity
          style={[
            styles.adoptButton,
            (adoptedPets[pet.id] || adopted) && styles.adoptedButton,
          ]}
          onPress={() => handleAdopt(pet.id, pet.uid, messageId, roomId)}
          disabled={adoptedPets[pet.id] || adopted || pet.status == 'have_owner'}>
          <Text style={styles.buttonText}>
            {adoptedPets[pet.id] || adopted ? 'Adopted' : 'Adopt'}
          </Text>
        </TouchableOpacity>
      )}
    </View>

  );

  const TelephoneInfo = ({ telephoneNumber, isCurrentUser }) => (
    <View style={styles.telsContainer}>
      <Text style={styles.telstyle}>
        {isCurrentUser
          ? `You sent ${telephoneNumber} `
          : // : telephoneNumber}
          `${senderName}'s number ${telephoneNumber}`}
      </Text>
      {!isCurrentUser && (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(telephoneNumber)}>
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  const LocationInfo = ({ location }) => {
    const openInGoogleMaps = () => {
      const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
      Linking.openURL(url).catch(err =>
        console.error('Error opening Google Maps:', err),
      );
    };

    return (
      <TouchableOpacity onPress={openInGoogleMaps}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Location"
          />
        </MapView>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <View style={styles.container}>
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUser : styles.otherUser,
          ]}>
          {!isCurrentUser && profileURL && (
            <Image source={{ uri: profileURL }} style={styles.profileImage} />
          )}
          <View style={styles.messageContent}>
            {imageUrl ? (
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={{ uri: imageUrl }} style={styles.messageImage} />
              </TouchableOpacity>
            ) : (
              <Text style={styles.messageText}>{text}</Text>
            )}
            {selectedPets.length > 0 && (
              <View style={styles.petsContainer}>
                {selectedPets.map((pet, index) => (
                  <PetItem key={index} pet={pet} />
                ))}
              </View>
            )}
            {telephoneNumber && (
              <TelephoneInfo
                telephoneNumber={telephoneNumber}
                isCurrentUser={isCurrentUser}
              />
            )}
            {location && <LocationInfo location={location} />}
            <Text style={styles.timestamp}>{formattedCreatedAt}</Text>
          </View>

        </View>

      </View>
      <FullScreenModal
        imageUri={imageUrl}
        thumbnailStyle={styles.image}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </>
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
    fontFamily: 'InterRegular',
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
    fontFamily: 'InterSemiBold',
    textAlign: 'center',
  },
  adoptButton: {
    width: 140,
    padding: 10,
    backgroundColor: '#D27C2C',
    borderRadius: 5,
    margin: 10,
    marginBottom: 0,
  },
  adoptedButton: {
    backgroundColor: 'rgba(rgba(210, 124, 44, 0.5))',
  },
  callButton: {
    width: 140,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    margin: 10,
    marginBottom: 0,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  telstyle: {
    fontSize: 16,
    fontFamily: 'InterRegular',
    marginLeft: 10,
    textAlign: 'left',
  },
  telsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default memo(MessageItem);
