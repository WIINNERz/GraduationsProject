import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  PermissionsAndroid,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

export default function PlusBoxChatRoom({ onImagePicked, onSendPets }) {
  const [isPetPanelVisible, setPetPanelVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [petData, setPetData] = useState(null);
  const [selectedPets, setSelectedPets] = useState({});
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

  const fetchPetData = async () => {
    setLoading(true);
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

        setPetData(petList);
      } catch (err) {
        setError(err.message);
        console.log('Error fetching pet data:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError('User is not authenticated');
      console.log('User is not authenticated');
    }
  };

  const pickPet = () => {
    setPetPanelVisible(!isPetPanelVisible);
    if (!isPetPanelVisible) {
      fetchPetData();
    }
  };

  const togglePetSelection = (petId) => {
    setSelectedPets(prevState => ({
      ...prevState,
      [petId]: !prevState[petId]
    }));
  };

  const handleSendPets = () => {
    const selectedPetData = petData.filter(pet => selectedPets[pet.id]);
    onSendPets(selectedPetData);
    setPetPanelVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <TouchableOpacity
          style={styles.buttonStyle}
        >
          <MaterialCommunityIcons
            name="map-marker"
            size={30}
            color="#E16539"
          />
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
        <TouchableOpacity style={styles.buttonStyle}>
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
      {isPetPanelVisible && (
        <View style={styles.petPanel}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setPetPanelVisible(false)}>
            <Text>Close</Text>
          </TouchableOpacity>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            petData ? (
              petData.map((pet, index) => (
                <TouchableOpacity key={index} style={styles.petItem} onPress={() => togglePetSelection(pet.id)}>
                  <View style={styles.petImageContainer}>
                    <Image source={{ uri: pet.photoURL }} style={styles.petImage} />
                    {selectedPets[pet.id] && (
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