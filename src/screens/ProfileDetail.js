import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Keymanagement from '../components/Keymanagement';
import CryptoJS from "rn-crypto-js";
import { decrypt } from 'react-native-aes-crypto';
const ProfileDetail = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [tel, setTel] = useState('');
  const [telEmergency, setTelEmergency] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const user = auth.currentUser;
  const KeymanagementInstance = Keymanagement();
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: [styles.tabBar, { backgroundColor:'#F0DFC8' }],// Reset tabBarStyle to default
        });
      };
    }, [navigation])
  );
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(firestore, 'Users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists() && docSnap.data().email === user.email) {
          const data = docSnap.data();
          try {
          const decryptedFirstname = data.firstname ? await KeymanagementInstance.decryptData(data.firstname) : null;
          const decryptedLastname = data.lastname ? await KeymanagementInstance.decryptData(data.lastname) : null;
          const decryptedTel = data.tel ? await KeymanagementInstance.decryptData(data.tel) : null;
          const decryptedTelEmergency = data.telEmergency ? await KeymanagementInstance.decryptData(data.telEmergency) : null;
          const decryptedAddress = data.address ? await KeymanagementInstance.decryptData(data.address) : null;
          const decryptedDistrict = data.district ? await KeymanagementInstance.decryptData(data.district) : null;
          const decryptedProvince = data.province ? await KeymanagementInstance.decryptData(data.province) : null;
          const decryptedZipcode = data.zipcode ? await KeymanagementInstance.decryptData(data.zipcode) : null;  
          setUserData(data);
          setFirstname(decryptedFirstname);
          setLastname(decryptedLastname);
          setUsername(data.username);
          setEmail(data.email);
          setTel(decryptedTel);
          setTelEmergency(decryptedTelEmergency);
          setAddress(decryptedAddress);
          setDistrict(decryptedDistrict);
          setProvince(decryptedProvince);
          setZipcode(decryptedZipcode);
          } catch (error) {
            console.error('Error decrypting data: ', error);
          }
          
        } else {
          console.log('No matching user data found');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  // const handleSave = async () => {
  //   if (user) {
  //     const key = await KeymanagementInstance.retrievemasterkey();
      
  //     const userDoc = doc(firestore, 'Users', user.uid);
  //     const updatedData = {
  //       // firstname: firstname || null,
  //       firstname : KeymanagementInstance.encryptData(firstname) || null,
  //       lastname: lastname || null,
  //       username: username || null,
  //       email: email || null,
  //       tel: tel || null,
  //       telEmergency: telEmergency || null,
  //       address: address || null,
  //       district: district || null,
  //       province: province || null,
  //       zipcode: zipcode || null
  //     };
  //     console.log('Encrypted Firstname: ', firstname);
  
  //     try {
  //       await updateDoc(userDoc, updatedData);
  //       navigation.navigate('Profiles');
  //     } catch (error) {
  //       Alert.alert('Error', 'Failed to update profile. Please try again.', [{ text: 'OK' }]);
  //       console.error('Error updating document: ', error);
  //     }
  //   } else {
  //     Alert.alert('Error', 'Failed to update profile. Please try again.', [{ text: 'OK' }]);
  //   }
  // };
  const handleSave = async () => {
  if (user) {
    const userDoc = doc(firestore, 'Users', user.uid);
    
    try {
      const encryptedFirstname = firstname ? await KeymanagementInstance.encryptData(firstname) : null;
      const encryptedLastname = lastname ? await KeymanagementInstance.encryptData(lastname) : null;
      const encryptedTel = tel ? await KeymanagementInstance.encryptData(tel) : null;
      const encryptedTelEmergency = telEmergency ? await KeymanagementInstance.encryptData(telEmergency) : null;
      const encryptedAddress = address ? await KeymanagementInstance.encryptData(address) : null;
      const encryptedDistrict = district ? await KeymanagementInstance.encryptData(district) : null;
      const encryptedProvince = province ? await KeymanagementInstance.encryptData(province) : null;
      const encryptedZipcode = zipcode ? await KeymanagementInstance.encryptData(zipcode) : null;
      
      const updatedData = {
        firstname: encryptedFirstname,
        lastname: encryptedLastname,
        username: username || null,
        email: email || null,
        tel: encryptedTel,
        telEmergency: encryptedTelEmergency,
        address: encryptedAddress,
        district: encryptedDistrict,
        province: encryptedProvince,
        zipcode: encryptedZipcode
      };

      await updateDoc(userDoc, updatedData);
      navigation.navigate('Profiles');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.', [{ text: 'OK' }]);
      console.error('Error updating document: ', error);
    }
  } else {
    Alert.alert('Error', 'Failed to update profile. Please try again.', [{ text: 'OK' }]);
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
    <View style={{ backgroundColor: 'rgba(rgba(210, 124, 44, 0.5))', }}>
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
            <Text style={styles.topic}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.topic}>Edit Profile</Text>
          <TouchableOpacity style={styles.topic} onPress={handleSave}>
            <Text style={styles.topic}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profilePanel}>
          <View style={{ alignItems: 'center' }}>
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
            <View style={{ paddingTop: 10 }}>
              {userData.verify ? (
                <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail')}>
                  <View style={styles.verified}>
                    <Text style={{ color: 'black' }}>Verified</Text>
                    <MaterialCommunityIcons name="account-circle" size={20} color="#D27C2C" />
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.verified}>
                  <Text style={{ opacity: 0.5 }}>Not Verified</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
            />

          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Firstname</Text>
            <TextInput
              style={styles.input}
              value={firstname}
              onChangeText={setFirstname}
              placeholder="First Name"
            />

          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Lastname</Text>
            <TextInput
              style={styles.input}
              value={lastname}
              onChangeText={setLastname}
              placeholder="Last Name"
            />
          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Tel</Text>
            <TextInput
              style={styles.input}
              value={tel}
              onChangeText={setTel}
              placeholder="Telephone Number"
            />
          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Emergency Tel</Text>
            <TextInput
              style={styles.input}
              value={telEmergency}
              onChangeText={setTelEmergency}
              placeholder="Emergency Telephone Number"
            />
          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
            />
          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>District</Text>
            <TextInput
              style={styles.input}
              value={district}
              onChangeText={setDistrict}
              placeholder="District"
            />
          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Province</Text>
            <TextInput
              style={styles.input}
              value={province}
              onChangeText={setProvince}
              placeholder="Province"
            />
          </View>
          <View style={styles.myaccount}>
            <Text style={styles.name}>Post code</Text>
            <TextInput
              style={styles.input}
              value={zipcode}
              onChangeText={setZipcode}
              placeholder="Post Code"
            />
          </View>
          <View style={styles.myaccount}>
            <TouchableOpacity onPress={() => navigation.navigate('Verify')}>
              <View style={{width:'100%',alignItems : 'center',flexDirection:'row', justifyContent:'space-between' }}>
              <Text style={styles.name}>Verify your Account</Text>
              <MaterialCommunityIcons name="chevron-right" size={30} color="#D27C2C" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    marginTop: '10%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#F0DFC8',
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
    fontWeight: 'bold',
    color: 'black'

  },
  myaccount: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(130, 130, 130, 0.4)',

  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    position: 'absolute',
    top: 20,
    left: -35,
    backgroundColor: '#F0DFC8',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  topic: {
    color: 'black',
    fontWeight: 'bold',
  },
  verified: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 5,
    padding: 5,
    paddingLeft: 10,
    borderRadius: 50,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "8%", 
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default ProfileDetail;
