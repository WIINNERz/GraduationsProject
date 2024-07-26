import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore, storage } from '../configs/firebaseConfig'; // Adjust path if needed
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'; // Ensure this is imported

const Profiles = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const user = auth.currentUser; 

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(firestore, 'Users', user.uid); // Use firestore directly
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists() && docSnap.data().email === user.email) {
          setUserData(docSnap.data());
        } else {
          console.log('No matching user data found');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = () => {
    auth.signOut() // Use auth directly
      .then(() => {
        navigation.navigate('SignIn');
      })
      .catch((error) => {
        console.error(error);
      });
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

      setUserData(prevState => ({
        ...prevState,
        photoURL: downloadURL
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
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profilePanel}>
        <View style={styles.leftContent}>
          <View>
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
            <View style={{ flexDirection: 'row' }}>
              <Text>{userData.firstname}</Text>
              <Text>{userData.lastname}</Text>
            </View>
            <Text style={{ opacity: 0.5 }}>@{userData.username}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="account-edit" size={40} color="gray" />
      </View>
      <View style={styles.panel}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="account" size={30} color="gray" />
          </View>
          <View style={styles.myaccount}>
            <Text>My Account</Text>
            <Text style={{ opacity: 0.5 }}>Make changes to your account</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={30} color="gray" />
      </View>

      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    width: '90%',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    height: 40,
    width: 40,
  },
  myaccount: {
    padding: 10,
    alignContent: 'flex-start',
  },
  profilePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    width: '90%',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 100,
    borderWidth: 2,
  },
  camera: {
    position: 'absolute',
    top: -30,
    left: 50,
  },
});

export default Profiles;
