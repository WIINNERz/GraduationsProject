import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { getFirestore, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../configs/firebaseConfig'; // Ensure storage is imported from your firebaseconfig
import MyPet from './MyPet';
import BackButton from './backbutton';
import { Text } from 'react-native-paper';

const AddPet = () => {
  const db = getFirestore();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [type, setType] = useState('');
  const [image, setImage] = useState('');
  const [species, setSpecies] = useState('');
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [listStatus, setListStatus] = useState([
    { label: 'Have Owner', value: 'have_owner' },
    { label: "Dont't have Owner", value: 'dont_have_owner' },
  ]);
  const [value, setValue] = useState(null);
  const [uploading, setUploading] = useState(false); // Added state for uploading
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

  const pickImage = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Gallery', onPress: () => openImageLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openImageLibrary = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri, petDocRef) => {
    if (!uri) return;

    setUploading(true);

    const user = auth.currentUser;
    if (!user) {
      console.error('No user is currently logged in.');
      return;
    }

    const storageRef = ref(
      storage,
      `images/${user.uid}/pets/${name}/${Date.now()}`,
    );

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Uploaded a blob or file!');

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at', downloadURL);

      await updateDoc(petDocRef, { photoURL: downloadURL });

      Alert.alert('Success', 'Pet photo updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      console.error('Error uploading image: ', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <BackButton />
      <Text style={styles.title}> Add Pet </Text>

      <View style={styles.inputcontainer}>
        <TouchableOpacity onPress={pickImage}>
          <MaterialCommunityIcons
            style={styles.camera}
            name="camera"
            size={35}
            color="#3A3A3A"
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          value={name}
          onChangeText={value => setName(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter age"
          value={age}
          onChangeText={value => setAge(value)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter type"
          value={type}
          onChangeText={value => setType(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter species"
          value={species}
          onChangeText={value => setSpecies(value)}
        />
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={listStatus}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select item"
          value={value}
          onChange={item => {
            setStatus(item.value);
          }}
          renderItem={renderItem}
        />
        <TouchableOpacity style={styles.submit} onPress={handleSubmit} ><Text style={{ fontWeight: 'bold' }}>Submit</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    margin: 10,
  },
  inputcontainer: {
    padding: 10,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '10%',
    backgroundColor: '#F0DFC8',
    borderRadius: 10,
  },
  input: {
    width: '80%',
    padding: 10,
    margin: 10,
    borderBottomColor: '#000',
    borderBottomWidth: 1,
  },
  submit: {
    width: '25%',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    height: '8%',
    fontWeight: 'bold',
    alignItems: 'center',
    backgroundColor: '#E16539',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: '15%',
    fontWeight: 'bold',
    color: '#E16539',
  },
  dropdown: {
    margin: 16,
    height: 50,
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },

});

export default AddPet;
