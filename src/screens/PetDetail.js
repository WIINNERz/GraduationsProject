import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';

import {auth, storage, firestore} from '../configs/firebaseConfig';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Checkbox from '../components/checkbox';
import CryptoJS from 'rn-crypto-js';
import Keymanagement from '../components/Keymanagement';

const PetDetail = () => {
  const db = getFirestore();
  const user = auth.currentUser;
  const [petId, setPetId] = useState('');
  const [userData, setUserData] = useState(null);
  const [pet, setPet] = useState({
    name: '',
    age: '',
    breeds: '',
    weight: '',
    height: '',
    gender: '',
    color: '',
    characteristics: '',
    chronic: '',
    location,
    conditions: '',
    birthday: '',
    adoptingConditions,
    //additionalImages: [],
  });
  const [isFindHomeChecked, setIsFindHomeChecked] = useState(false);
  const [adoptingConditions, setAdoptingConditions] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState('');

  //const [additionalImages, setAdditionalImages] = useState([]);
  const route = useRoute();
  const [image, setImage] = useState('');
  const {id} = route.params;
  const navigation = useNavigation();
  const KeymanagementInstance = new Keymanagement();

  useEffect(() => {
    if (!user) return;

    const userDoc = doc(firestore, 'Users', user.uid);

    const unsubscribe = onSnapshot(
      userDoc,
      docSnap => {
        if (docSnap.exists() && docSnap.data().email === user.email) {
          setUserData(docSnap.data());
        } else {
          console.log('No matching user data found');
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const fetchUsername = async uid => {
    const userDocRef = doc(db, 'Users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().username;
    } else {
      console.error('No such user document!');
      return '';
    }
  };

  useEffect(() => {
    const fetchPet = async () => {
      const key = await KeymanagementInstance.retrievemasterkey();
      try {
        const petDocRef = doc(db, 'Pets', id);
        const petDoc = await getDoc(petDocRef);
        if (petDoc.exists()) {
          let petData = petDoc.data() || {};
          if (petData.status === 'have_owner') {
            petData = {
              ...petData,
              age: petData.age
                ? CryptoJS.AES.decrypt(petData.age, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              breeds: petData.breeds
                ? CryptoJS.AES.decrypt(petData.breeds, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              weight: petData.weight
                ? CryptoJS.AES.decrypt(petData.weight, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              height: petData.height
                ? CryptoJS.AES.decrypt(petData.height, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              characteristics: petData.characteristics
                ? CryptoJS.AES.decrypt(petData.characteristics, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              chronic: petData.chronic
                ? CryptoJS.AES.decrypt(petData.chronic, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              location: petData.location
                ? CryptoJS.AES.decrypt(petData.location, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              conditions: petData.conditions
                ? CryptoJS.AES.decrypt(petData.conditions, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              color: petData.color
                ? CryptoJS.AES.decrypt(petData.color, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              gender: petData.gender
                ? CryptoJS.AES.decrypt(petData.gender, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
              birthday: petData.birthday
                ? CryptoJS.AES.decrypt(petData.birthday, key).toString(
                    CryptoJS.enc.Utf8,
                  )
                : '',
            };
          }
          setPet(petData);
        } else {
          setError('Pet not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleSave = async () => {
    try {
      if (!user) {
        console.error('No user is currently logged in.');
        return;
      }

      const id = name; // Ensure you have a valid document ID
      const dateTime = Timestamp.now();
      const username = await fetchUsername(user.uid);
      const key = await KeymanagementInstance.retrievemasterkey();

      if (!username) return;
      if (!pet.name) {
        Alert.alert('Error', 'Pet name cannot be empty.');
        return;
      }

      const {
        name = '',
        age = '',
        breeds = '',
        weight = '',
        height = '',
        characteristics = '',
        chronic = '',
        location = '',
        conditions = '',
        color = '',
        gender = '',
        birthday,
        adoptingConditions = '',
      } = pet;

      let dataToStore;

      if (isFindHomeChecked) {
        dataToStore = {
          ...pet,
          name: name.trim(),
          age,
          breeds,
          weight,
          height,
          characteristics,
          chronic,
          location,
          conditions,
          color,
          gender,
          birthday,
          adoptingConditions,
          updatedAt: Timestamp.now(),
        };
      } else {
        dataToStore = {
          ...pet,
          name: name.trim(),
          age: age ? CryptoJS.AES.encrypt(String(age), key).toString() : null,
          breeds: breeds
            ? CryptoJS.AES.encrypt(String(breeds), key).toString()
            : null,
          weight: weight
            ? CryptoJS.AES.encrypt(String(weight), key).toString()
            : null,
          height: height
            ? CryptoJS.AES.encrypt(String(height), key).toString()
            : null,
          characteristics: characteristics
            ? CryptoJS.AES.encrypt(String(characteristics), key).toString()
            : null,
          chronic: chronic
            ? CryptoJS.AES.encrypt(String(chronic), key).toString()
            : null,
          conditions:
            conditions.length > 0
              ? conditions.map(condition =>
                  CryptoJS.AES.encrypt(String(condition), key).toString(),
                )
              : [],
          color: color
            ? CryptoJS.AES.encrypt(String(color), key).toString()
            : null,
          gender: gender
            ? CryptoJS.AES.encrypt(String(gender), key).toString()
            : null,
          birthday: birthday
            ? CryptoJS.AES.encrypt(birthday, key).toString()
            : null,
          updatedAt: Timestamp.now(),
        };
      }

      // Remove any fields that are undefined
      Object.keys(dataToStore).forEach(key => {
        if (dataToStore[key] === undefined) {
          delete dataToStore[key];
        }
      });

      console.log('Data to store:', dataToStore);

      // Ensure the document reference has an even number of segments
      const petDocRef = doc(db, 'Pets', name);
      await updateDoc(petDocRef, dataToStore);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
      console.error('Error saving pet data:', err);
    }
  };

  useEffect(() => {
    if (pet?.status === 'dont_have_owner') {
      setIsFindHomeChecked(true);
    }
  }, [pet]);

  const onPress = () => {
    setIsFindHomeChecked(!isFindHomeChecked);
    setPet(prevPet => ({
      ...prevPet,
      status: !isFindHomeChecked ? 'dont_have_owner' : 'have_owner',
    }));
  };

  const handleDelete = async () => {
    Alert.alert('Delete Pet', 'Are you sure you want to delete this pet?', [
      {
        text: 'Yes',
        onPress: () => {
          // Wrap the async function in a synchronous function
          (async () => {
            try {
              await deletePet(); // Replace with your actual async function
              console.log('Pet deleted successfully');
              navigation.navigate('MyPets');
            } catch (error) {
              console.error('Error deleting pet:', error);
            }
          })();
        },
      },
      {
        text: 'No',
        onPress: () => console.log('Delete action cancelled'),
        style: 'cancel',
      },
    ]);
  };

  const deletePet = async () => {
    try {
      const petDocRef = doc(firestore, 'Pets', pet.id); // Replace 'petId' with the actual pet ID
      await deleteDoc(petDocRef);
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };
  const pickImage = () => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          openCamera();
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          openImageLibrary();
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const openImageLibrary = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 1});
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const result = await launchCamera({mediaType: 'photo', quality: 1});
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async uri => {
    if (!uri) return;

    setUploading(true);
    const storageRef = ref(
      storage,
      `images/${user.uid}/pets/${pet.name}/${Date.now()}`,
    );
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const petDoc = doc(db, 'Pets', id);
      await updateDoc(petDoc, {photoURL: downloadURL});

      setPet(prevState => ({
        ...prevState,
        photoURL: downloadURL,
      }));

      Alert.alert('Success', 'Profile photo updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      console.error('Error uploading image: ', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          style={styles.back}
          name="arrow-left"
          size={35}
          color="#D27C2C"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.screenTitle}>Edit Pet Profile</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={styles.container}>
        {pet?.photoURL ? (
          <Image source={{uri: pet.photoURL}} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="account" size={50} color="gray" />
        )}
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.camera}>
            <MaterialCommunityIcons name="camera" size={30} color="#3A3A3A" />
          </View>
        </TouchableOpacity>
        <View style={styles.subContainer}>
          <View style={styles.whContainer}>
            <View style={styles.containerwh}>
              <Text>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={pet?.name || ''}
                onChangeText={text => setPet({...pet, name: text})}
              />
            </View>
            <View style={styles.containerwh}>
              <Text>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor={'gray'}
                value={pet.age || ''}
                editable={false}
              />
            </View>
          </View>
          <Text>Breeds</Text>
          <TextInput
            style={styles.input}
            placeholder="Breed"
            value={pet?.breeds || ''}
            onChangeText={text => setPet({...pet, breeds: text})}
          />
          <Text> Birthday </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={pet?.birthday || ''}
              editable={false}
            />
          </View>
          <View style={styles.whContainer}>
            <View style={styles.containerwh}>
              <Text>Weight</Text>
              <TextInput
                style={styles.inputwh}
                placeholder="Weight"
                keyboardType="numeric"
                value={pet?.weight ? `${pet.weight}` || '' : ''}
                onChangeText={text =>
                  setPet({...pet, weight: parseFloat(text)})
                }
              />
            </View>
            <View style={styles.containerwh}>
              <Text>Height</Text>
              <TextInput
                style={styles.inputwh}
                placeholder="Height"
                keyboardType="numeric"
                value={pet?.height ? `${pet.height}` || '' : ''}
                onChangeText={text =>
                  setPet({...pet, height: parseFloat(text)})
                }
              />
            </View>
          </View>
          <View style={styles.whContainer}>
            <View style={styles.containerwh}>
              <Text>Color</Text>
              <TextInput
                style={styles.inputwh}
                placeholder="Color"
                value={pet?.color ? `${pet.color}` || '' : ''}
                onChangeText={text => setPet({...pet, color: text})}
              />
            </View>
            <View style={styles.containerwh}>
              <Text>Gender</Text>
              <TextInput
                style={styles.inputwh}
                placeholder="Gender"
                value={pet?.gender ? `${pet.gender}` || '' : ''}
                editable={false}
              />
            </View>
          </View>
          <View style={styles.whContainer}>
            <View style={styles.container}>
              <Text>Characteristics</Text>
              <TextInput
                style={styles.inputwh}
                placeholder="Characteristics"
                value={
                  pet?.characteristics ? `${pet.characteristics}` || '' : ''
                }
                onChangeText={text => setPet({...pet, characteristics: text})}
              />
            </View>
          </View>
          <View style={styles.whContainer}>
            <View style={styles.container}>
              <Text>Chronic</Text>
              <TextInput
                style={styles.inputwh}
                placeholder="Chronic"
                value={pet?.chronic ? `${pet.chronic}` || '' : ''}
                onChangeText={text => setPet({...pet, chronic: text})}
              />
            </View>
          </View>
          <Checkbox
            text="Find Home"
            onPress={onPress}
            value={pet?.status ? `${pet.status}` || '' : ''}
            isChecked={isFindHomeChecked}
          />

          {isFindHomeChecked && (
            <View style={styles.adoptionDetailsContainer}>
              <Text>Location</Text>
              <TextInput
                style={styles.inputwh}
                placeholder="Location"
                placeholderTextColor={'gray'}
                value={pet?.location ? pet.location || '' : ''}
                onChangeText={text =>
                  setPet(prevPet => ({...prevPet, location: text}))
                }
              />
              <Text>Adopting Conditions</Text>
              <TextInput
                style={styles.input}
                placeholder="Adopting Conditions"
                value={pet?.adoptingConditions || ''} // Fallback to empty string if pet.adoptingConditions is null or undefined
                onChangeText={
                  text =>
                    setPet(prevPet => ({...prevPet, adoptingConditions: text})) // Update adoptingConditions with new text
                }
              />
            </View>
          )}
        </View>
        <View style={styles.buttonPanel}>
          <TouchableOpacity style={styles.buttonS} onPress={() => handleSave()}>
            <Text>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonD}
            onPress={() => handleDelete()}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
        {uploading && <ActivityIndicator size="small" color="#0000ff" />}
      </ScrollView>
    </View>
  );
};
const {width} = Dimensions.get('window');

const titleSize = width / 17;
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 80,
    flexGrow: 1,
    paddingBottom: 80,
    alignItems: 'center',
  },
  subContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
  },
  whContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  containerwh: {
    width: '45%',
    backgroundColor: '#fff',
    marginHorizontal: 17,
  },
  input: {
    width: '100%',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    color: 'black',
  },
  inputwh: {
    width: '100%',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  inputDate: {
    width: '90%',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 2,
  },
  camera: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 50,
    position: 'absolute',
    top: -30,
    left: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
  },
  buttonPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  buttonS: {
    width: '40%',
    backgroundColor: '#F0DFC8',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonD: {
    width: '40%',
    backgroundColor: '#F0DFC8',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  adoptionDetailsContainer: {
    marginTop: 20,
  },
  header: {
    width: '100%',
    height: '8%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  back: {
    position: 'absolute',
    left: 20,
  },
  screenTitle: {
    fontSize: titleSize,
    fontFamily: 'InterBold',
    color: '#D27C2C',
    paddingTop: 5,
  },
});

export default PetDetail;
