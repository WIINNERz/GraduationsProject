import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pickImage, openImageLibrary, openCamera, uploadImage } from '../components/camera' // Import functions from Camera.js


const Profiles = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activated, setActivated] = useState(false);
  const user = auth.currentUser;

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

  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        navigation.navigate('SignIn');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
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
            <TouchableOpacity onPress={pickImage} style={styles.cameraButton}>
              <MaterialCommunityIcons name="camera" size={30} color="#3A3A3A" />
            </TouchableOpacity>
          </View>
          <View style={styles.myaccount}>
            <View style={{ flexDirection: 'row' }}>
              <Text>{userData.firstname}</Text>
              <Text> </Text>
              <Text>{userData.lastname}</Text>
            </View>
            <Text style={{ opacity: 0.5 }}>@{userData.username}</Text>
            {userData.verify ? (
                <View style={styles.verified}>
                <Text>Verified</Text>
                <Text> </Text>
                <MaterialCommunityIcons name="check-circle" size={20} color="green" />
                </View>
            ) : (
              <TouchableOpacity style={styles.verified} onPress={() => navigation.navigate('ProfileDetail')}>
              <Text style={{ opacity: 0.5 }}>Not Verified</Text>
              </TouchableOpacity>

            )}

          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail')}>
          <MaterialCommunityIcons name="account-edit" size={40} color="gray" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('MyAccount')}>
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
      </TouchableOpacity>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View >
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
    marginVertical: 10,
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
    marginBottom: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#d0d0d0',
  },
  cameraButton: {
    position: 'absolute',
    top: 50,
    left: 50,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  verified: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 10,
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Profiles;
