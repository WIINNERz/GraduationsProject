import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const ProfileDetail = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(firestore, 'Users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists() && docSnap.data().email === user.email) {
          const data = docSnap.data();
          setUserData(data);
          setFirstname(data.firstname);
          setLastname(data.lastname);
          setUsername(data.username);
          setEmail(data.email);
        } else {
          console.log('No matching user data found');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (user) {
      const userDoc = doc(firestore, 'Users', user.uid);
      await updateDoc(userDoc, {
        firstname,
        lastname,
        username,
        email,
      });
      Alert.alert('Profile Saved', 'Profile updated successfully', [{ text: 'OK' }]);
    }
  };

  const pickImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openImageLibrary() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openImageLibrary = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) return;

    setUploading(true);

    const storageRef = ref(storage, `images/${user.uid}/${Date.now()}`);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Uploaded a blob or file!');

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at', downloadURL);

      const userDoc = doc(firestore, 'Users', user.uid);
      await updateDoc(userDoc, { photoURL: downloadURL });

      setUserData((prevState) => ({
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

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>No user data found or email mismatch.</Text>
      </View>
    );
  }

  return (
    <View style={{    backgroundColor: 'rgba(rgba(210, 124, 44, 0.5))',}}>
    <View style={styles.container}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#D27C2C',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,

      }}>
        <TouchableOpacity style={styles.topic} onPress={() => navigation.navigate('Profiles')}>
          <Text>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.topic}>Edit Profile</Text>
        <TouchableOpacity style={styles.topic} onPress={() => navigation.navigate('Profiles')}>
          <Text>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profilePanel}>
        <View style={styles.leftContent}>
          {userData.photoURL ? (
            <Image source={{ uri: userData.photoURL }} style={styles.image} />
          ) : (
            <MaterialCommunityIcons name="account" size={50} color="gray" />
          )}
          <TouchableOpacity onPress={pickImage}>
            <MaterialCommunityIcons style={styles.camera} name="camera" size={30} color="#3A3A3A" />
          </TouchableOpacity>
        </View>
        <View style={styles.myaccount}>
          <Text style={styles.name}>Firstname</Text>
          <TextInput
            style={styles.input}
            value={firstname}
            onChangeText={setFirstname}
            placeholder="First Name"
          />
          <Text style={styles.name}>Lastname</Text>
          <TextInput
            style={styles.input}
            value={lastname}
            onChangeText={setLastname}
            placeholder="Last Name"
          />
        </View>
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={{ color: '#3A3A3A', marginRight: 10 }}>Switch To Foundation</Text>
            <MaterialCommunityIcons name='chevron-right' size={30} color='#3A3A3A' />
          </TouchableOpacity>
        </View>
        <Button title="Save" onPress={handleSave} />
      </View>
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    height: '90%',
    marginTop: '10%',
    backgroundColor: 'rgba(255, 255, 255, 1)', // พื้นหลังโปร่งใส
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  profilePanel: {
    width: '100%',
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#000',
  },
  input: {
    height: 40,
    padding: 10,
    marginTop: 10,
  },
  name: {
    height: 40,
    borderColor: 'gray',
    padding: 10,
    marginTop: 10,
  },
  myaccount: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#828282',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  camera: {
    position: 'absolute',
    top: 20,
    left: -30,
  },
  topic: {
    color:'black'
  },
});

export default ProfileDetail;
