import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Text,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { getFirestore, setDoc, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../configs/firebaseConfig'; // Ensure storage is imported from your firebaseconfig
import { pickImage, openImageLibrary, openCamera, uploadImage } from '../components/camera' // Import functions from Camera.js
import BackButton from '../components/backbutton';
import Checkbox from '../components/checkbox';

const AddPet = () => {
  const db = getFirestore();
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [type, setType] = useState('');
  const [breeds, setBreeds] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [characteristics, setCharacteristics] = useState('');
  const [chronic, setChronic] = useState('');
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState('');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [image, setImage] = useState([]);
  const [species, setSpecies] = useState('');
  const [status, setStatus] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [uploading, setUploading] = useState(false); // Added state for uploading
  const [listStatus, setListStatus] = useState([
    { label: 'Have Owner', value: 'have_owner' },
    { label: "Dont't have Owner", value: 'dont_have_owner' },
  ]);
  useEffect(() => {
    if (!user) return;

    const userDoc = doc(firestore, 'Users', user.uid);

    // Set up Firestore listener
    const unsubscribe = onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists() && docSnap.data().email === user.email) {
        setUserData(docSnap.data());
      } else {
        console.log('No matching user data found');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching user data:', error);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [user]);
  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
      </View>
    );
  };
  const fetchUsername = async uid => {
    const userDocRef = doc(db, 'Users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().username;
    } else {
      console.error('No such user document!');
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is currently logged in.');
        return;
      }

      const { uid } = user;
      const username = await fetchUsername(uid);
      if (!username) return;

      const petDocRef = doc(db, 'Pets', name);
      await setDoc(petDocRef, {
        uid,
        username,
        name,
        age,
        type,
        species,
        status,
      });

      if (image) {
        await uploadImage(image, petDocRef);
      }

      navigation.navigate('MyPet');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.container} >
      {/* <View style={{ flexDirection: 'row', padding: 20 }}>
        <BackButton />
        <Text style={styles.title}> Add Pet </Text>
      </View> */}
      <MaterialCommunityIcons name='dog' size={80} color='#D27C2C' style={{ alignSelf: 'center' }} />
      <TouchableOpacity onPress={pickImage}>
        <MaterialCommunityIcons
          name="camera"
          size={20}
          color="black"
          style={styles.camera}
        />
      </TouchableOpacity>

      <View style={styles.subContainer}>
        <Text>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name || ''}
          onChangeText={(text) => setPet({ ...pet, name: text })}
        />
        <Text>Breeds</Text>
        <TextInput
          style={styles.input}
          placeholder="Breeds"
          value={breeds || ''}
          onChangeText={(text) => setPet({ ...pet, breeds: text })}
        />
        <Text>Age (Birthday)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputDate}
            value={`Date: ${date.toLocaleDateString()}, Age: ${age}`}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShow(true)} style={styles.iconContainer}>
            <MaterialCommunityIcons name="calendar" size={24} color="black" />
          </TouchableOpacity>

        </View>
        <View style={styles.whContainer}>
          <View style={styles.containerwh}>
            <Text>Weight</Text>
            <TextInput
              style={styles.inputwh}
              placeholder="Weight"
              keyboardType="numeric"
              value={weight ? `${pet.weight} kg` : ''}
              onChangeText={(text) => setPet({ ...pet, weight: parseFloat(text) })}
            />
          </View>
          <View style={styles.containerwh}>
            <Text>Height</Text>
            <TextInput
              style={styles.inputwh}
              placeholder="Height"
              keyboardType="numeric"
              value={height ? `${pet.height} cm` : ''}
              onChangeText={(text) => setPet({ ...pet, height: parseFloat(text) })}
            />
          </View>
        </View>
        <Text>Characteristics</Text>
        <TextInput
          style={styles.input}
          placeholder="Characteristics"
          value={characteristics || ''}
          onChangeText={(text) => setPet({ ...pet, characteristics: text })} />
        <Text>Chronic Disease</Text>
        <TextInput
          style={styles.input}
          placeholder="Chronic Disease"
          value={chronic || ''}
          onChangeText={(text) => setPet({ ...pet, chronic: text })} />
        <Checkbox
          text="Find Owner"
          isChecked={isChecked}
          onPress={() => {
            setIsChecked(!isChecked);
          }}
          style={styles.checkbox}
        />
        {isChecked && (
          <>
            <Text>Present Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Present Location"
              value={location || ''}
              onChangeText={(text) => setPet({ ...pet, location: text })} />
            <Text>Condition of Adoption</Text>
            <TextInput
              style={styles.inputC}
              placeholder="Condition of Adoption"
              value={conditions || ''}
              onChangeText={(text) => setPet({ ...pet, conditions: text })} />
            <Text>Additional pictures</Text>
            <View style={styles.imagePanel}>
              <TouchableOpacity onPress={() => pickImage(setImage)}>
                <MaterialCommunityIcons
                  name="camera"
                  size={20}
                  color="black"
                  style={styles.cameraP}
                />
              </TouchableOpacity>
              {image.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.uri }}
                  style={styles.imagePet}
                />
              ))}
            </View>
          </>
        )}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  inputC: {
    width: '100%',
    height: 100,
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
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
  imagePanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 150,
    marginVertical: 10,
    borderWidth: 1,
  },
  imagePet: {
    width: 100,
    height: 100,
    margin: 10,
  },
  cameraP: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 50,
  },
});

export default AddPet;
