import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth } from '../configs/firebaseConfig';
import Keymanagement from './Keymanagement';

export default function PlusBoxChatRoom({ onImagePicked, onSendPets ,onSendTelephone }) {
  const [state, setState] = useState({
    isPetPanelVisible: false,
    loading: true,
    error: null,
    petData: null,
    selectedPets: {},
    telephoneNumber: '',
  });

  const KeymanagementInstance = Keymanagement();
  const user = auth.currentUser;

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.error) {
      console.log('ImagePicker Error: ', result.error);
    } else {
      const { uri } = result.assets[0];
      onImagePicked(uri);
    }
  };

  const fetchPetData = useCallback(async () => {
    setState(prevState => ({ ...prevState, loading: true }));
    if (user) {
      try {
        const db = getFirestore();
        const petsCollection = collection(db, 'Pets');
        const q = query(petsCollection, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const petList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setState(prevState => ({ ...prevState, petData: petList, loading: false }));
      } catch (err) {
        setState(prevState => ({ ...prevState, error: err.message, loading: false }));
        console.log('Error fetching pet data:', err.message);
      }
    } else {
      setState(prevState => ({ ...prevState, loading: false, error: 'User is not authenticated' }));
      console.log('User is not authenticated');
    }
  }, [user]);

  const pickPet = () => {
    setState(prevState => ({ ...prevState, isPetPanelVisible: !prevState.isPetPanelVisible }));
    if (!state.isPetPanelVisible) {
      fetchPetData();
    }
  };

  const togglePetSelection = (petId) => {
    setState(prevState => ({
      ...prevState,
      selectedPets: {
        ...prevState.selectedPets,
        [petId]: !prevState.selectedPets[petId]
      }
    }));
  };

  const handleSendPets = () => {
    const selectedPetData = state.petData.filter(pet => state.selectedPets[pet.id]);
    onSendPets(selectedPetData);
    setState(prevState => ({ ...prevState, isPetPanelVisible: false }));
  };

  const fetchTelephoneNumber = useCallback(async () => {
    if (user) {
      try {
        const db = getFirestore();
        const userDocRef = doc(db, 'Users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const decryptedTel = userData.tel ? await KeymanagementInstance.decryptData(userData.tel) : null;
          setState(prevState => ({
            ...prevState,
            telephoneNumber: decryptedTel || 'No telephone number found'
          }));
                if (onSendTelephone) {
            onSendTelephone(decryptedTel || 'No telephone number found');
          }
        } else {
          setState(prevState => ({ ...prevState, telephoneNumber: 'No telephone number found' }));
          Alert.alert('Telephone Number', 'No telephone number found');
        }
      } catch (err) {
        console.log('Error fetching telephone number:', err.message);
      }
    } else {
      console.log('User is not authenticated');
    }
  }, [user, KeymanagementInstance, onSendTelephone]);

  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <TouchableOpacity style={styles.buttonStyle}>
          <MaterialCommunityIcons name="map-marker" size={30} color="#E16539" />
        </TouchableOpacity>
        <Text>Location</Text>
      </View>
      <View style={styles.button}>
        <TouchableOpacity style={styles.buttonStyle} onPress={pickImage}>
          <MaterialCommunityIcons name="image" size={30} color="#E16539" />
        </TouchableOpacity>
        <Text>Photo</Text>
      </View>
      <View style={styles.button}>
        <TouchableOpacity style={styles.buttonStyle} onPress={fetchTelephoneNumber}>
          <MaterialCommunityIcons name="phone" size={30} color="#E16539" />
        </TouchableOpacity>
        <Text>Telephone</Text>
        <Text>Number</Text>
      </View>
      <View style={styles.button}>
        <TouchableOpacity style={styles.buttonStyle} onPress={pickPet}>
          <MaterialCommunityIcons name="dog-side" size={30} color="#E16539" />
        </TouchableOpacity>
        <Text>Transfer Pet Profile</Text>
      </View>
      {state.isPetPanelVisible && (
        <View style={styles.petPanel}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setState(prevState => ({ ...prevState, isPetPanelVisible: false }))}>
            <Text>Close</Text>
          </TouchableOpacity>
          {state.loading ? (
            <Text>Loading...</Text>
          ) : (
            state.petData ? (
              state.petData.map((pet, index) => (
                <TouchableOpacity key={index} style={styles.petItem} onPress={() => togglePetSelection(pet.id)}>
                  <View style={styles.petImageContainer}>
                    <Image source={{ uri: pet.photoURL }} style={styles.petImage} />
                    {state.selectedPets[pet.id] && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color="#fff"
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                  <Text style={styles.petName}>{pet.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No pets found</Text>
            )
          )}
          <TouchableOpacity style={styles.sendButton} onPress={handleSendPets}>
            <Text>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE6E6',
    height: 120,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: 'row',
  },
  button: {
    height: 100,
    width: 100,
    padding: 15,
    alignItems: 'center',
  },
  buttonStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D9D9D9',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 'auto',
    paddingTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#F0DFC8',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  closeButton: {
    position: 'absolute',
    padding: 10,
    top: 10,
    left: 10,
    zIndex: 1,
  },
  sendButton: {
    position: 'absolute',
    padding: 10,
    top: 10,
    right: 10,
    zIndex: 1,
  },
  petItem: {
    alignItems: 'center',
    padding: 10,
  },
  petImageContainer: {
    position: 'relative',
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  petName: {
    fontSize: 16,
  },
  checkIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
});