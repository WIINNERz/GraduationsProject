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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFirestore, setDoc, doc, getDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import Checkbox from '../components/checkbox';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { CancelPButton, SavePButton } from '../components/Button';
import Calendar from '../components/calendar';

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
  const [imageP, setImageP] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userDoc = doc(firestore, 'Users', user.uid);

    const unsubscribe = onSnapshot(
      userDoc,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().email === user.email) {
          setUserData(docSnap.data());
        } else {
          console.log('No matching user data found');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const fetchUsername = async (uid) => {
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
      const id = name;
      const username = await fetchUsername(uid);
      if (!username) return;

      if (!name.trim()) {
        Alert.alert('Error', 'Pet name cannot be empty.');
        return;
      }

      const petDocRef = doc(db, 'Pets', name);
      await setDoc(petDocRef, {
        id,
        uid,
        username,
        name,
        age,
        type,
        breeds,
        weight,
        height,
        characteristics,
        chronic,
        location,
        conditions,
        ...(isChecked ? { status: 'dont_have_owner' } : {}),
      });

      // Upload profile image
      if (imageP) {
        setUploading(true);
        try {
          await uploadImage(imageP, petDocRef);
        } catch (error) {
          Alert.alert('Error', 'Failed to upload profile image. Please try again.');
          console.error('Error uploading profile image: ', error);
        } finally {
          setUploading(false);
        }
      }

      // Upload additional images
      if (additionalImages.length > 0) {
        setUploading(true);
        try {
          await uploadAdditionalImages(petDocRef);
        } catch (error) {
          Alert.alert('Error', 'Failed to upload additional images. Please try again.');
          console.error('Error uploading additional images: ', error);
        } finally {
          setUploading(false);
        }
      }

      navigation.navigate('MyPet');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const onDateChange = (selectedDate) => {
    setDate(selectedDate);
    calculateAge(selectedDate);
  };

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += daysInMonth;
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    if (years > 0) {
      setAge(`${years} year${years > 1 ? 's' : ''}`);
    } else if (months > 0) {
      setAge(`${months} month${months > 1 ? 's' : ''}`);
    } else {
      setAge(`${days} day${days > 1 ? 's' : ''}`);
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
      setImageP(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });

    if (!result.canceled) {
      setImageP(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri, petDocRef) => {
    if (!uri) return;

    setUploading(true);

    const storageRef = ref(storage, `images/${user.uid}/pets/${name}/${Date.now()}`);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Uploaded a blob or file!');

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at', downloadURL);

      await updateDoc(petDocRef, { photoURL: downloadURL });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      console.error('Error uploading image: ', error);
    } finally {
      setUploading(false);
    }
  };

  const pickAdditionalImages = () => {
    Alert.alert(
      'Select Additional Images',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openAdditionalCamera() },
        { text: 'Gallery', onPress: () => openAdditionalImageLibrary() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openAdditionalImageLibrary = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 0 });

    if (!result.canceled) {
      setAdditionalImages(prevImages => [...prevImages, ...result.assets.map(asset => asset.uri)]);
      Alert.alert('Success', 'Additional images uploaded successfully.');
    }
  };

  const openAdditionalCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });

    if (!result.canceled) {
      setAdditionalImages(prevImages => [...prevImages, result.assets[0].uri]);
    }
  };

  const uploadAdditionalImages = async (petDocRef) => {
    setUploading(true);
    try {
      for (const uri of additionalImages) {
        if (!uri) continue;

        const storageRef = ref(storage, `images/${user.uid}/pets/${name}/additional/${Date.now()}`);
        const response = await fetch(uri);
        const blob = await response.blob();

        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await updateDoc(petDocRef, {
          additionalImages: arrayUnion(downloadURL)
        });
      }
    } catch (error) {
      console.error('Error uploading additional images: ', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.container}>
      <MaterialCommunityIcons name="paw" size={50} color="#E16539" />
      <TouchableOpacity style={styles.PetPPicker} onPress={pickImage}>
        {imageP ? (
          <Image source={{ uri: imageP }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="camera-plus" size={20} color="#000" />
        )}
      </TouchableOpacity>
      <View style={styles.subContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pet Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Type"
          value={type}
          onChangeText={setType}
        />
        <TextInput
          style={styles.input}
          placeholder="Breeds"
          value={breeds}
          onChangeText={setBreeds}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputDate}
            value={`Date: ${date.toLocaleDateString()}, Age: ${age}`}
            editable={false}
          />
          <Calendar date={date} onChange={onDateChange} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Weight"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Height"
          value={height}
          onChangeText={setHeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Characteristics"
          value={characteristics}
          onChangeText={setCharacteristics}
        />
        <TextInput
          style={styles.input}
          placeholder="Chronic Diseases"
          value={chronic}
          onChangeText={setChronic}
        />
      </View>
      {userData?.verify ? (
        <>
          <View style={styles.checkboxContainer}>
            <Checkbox
              text="Find Owner"
              isChecked={isChecked}
              onPress={() => setIsChecked(!isChecked)}
            />
          </View>
          <View style={styles.subContainer}>
            {isChecked && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={location}
                  onChangeText={setLocation}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Conditions"
                  value={conditions}
                  onChangeText={setConditions}
                />
                <TouchableOpacity style={styles.additionalImagePicker} onPress={pickAdditionalImages}>
                  <Text style={styles.additionalImagePickerText}>Pick Additional Images</Text>
                </TouchableOpacity>
                <View style={styles.additionalImagesContainer}>
                  {additionalImages.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.additionalImage} />
                  ))}
                </View>
              </>
            )}
          </View>
        </>
      ) : null}
      <View style={styles.buttonContainer}>
        <CancelPButton onPress={() => navigation.navigate('MyPet')} />
        <SavePButton onPress={handleSubmit} />
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
  PetPPicker:{
    position:'absolute',
    top:45,
    right:175,
    padding: 5,
    borderRadius: 100,
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
  SavePButton: {
    backgroundColor: '#E16539',
    width: 100,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
  },
  additionalImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  additionalImage: {
    width: 100,
    height: 100,
    margin: 10,
  },
});


export default AddPet;
