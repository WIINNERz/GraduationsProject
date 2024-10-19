import React, { useEffect, useState } from 'react';
import CryptoJS from 'rn-crypto-js';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  collection,
  where,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import Checkbox from '../components/checkbox';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { CancelPButton, SavePButton } from '../components/Button';
import Calendar from '../components/calendar';
import Keymanagement from '../components/Keymanagement';

const AddPet = () => {
  const db = getFirestore();
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
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
    location: '',
    conditions: '',
    birthday: '',
    adoptingConditions: '',
    additionalImages: [],
  });
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [type, setType] = useState('');
  const [breeds, setBreeds] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [color, setColor] = useState('');
  const [characteristics, setCharacteristics] = useState('');
  const [chronic, setChronic] = useState('');
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState('');
  const [date, setDate] = useState(new Date());
  const [birthday, setBirthday] = useState(new Date());
  const [adoptingConditions, setAdoptingConditions] = useState('');
  const [imageP, setImageP] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [status, setStatus] = useState('have_owner');
  const [isFocus, setIsFocus] = useState(false);
  const [genderFocused, setGenderFocused] = useState(false);
  const [typeFocused, setTypeFocused] = useState(false);
  const KeymanagementInstance = Keymanagement();

  const data = [
    { label: "Don't have owner", value: 'dont_have_owner' },
    { label: 'Have owner', value: 'have_owner' },
  ];
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
      });
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }],
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [navigation]);
  useEffect(() => {
    if (!user) return;

    const userDoc = doc(firestore, 'Users', user.uid);

    const unsubscribe = onSnapshot(
      userDoc,
      docSnap => {
        if (docSnap.exists() && docSnap.data().email === user.email) {
          setUserData(docSnap.data());
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
  const generateUniqueRandomNumber = async () => {
    const checkRandomExists = async (random) => {
      const petsQuery = query(collection(firestore, 'Pets'), where('nid', '==', random));
      const querySnapshot = await getDocs(petsQuery);
      return !querySnapshot.empty;
    };

    let random;
    do {
      random = Math.floor(100000 + Math.random() * 900000); // Ensure 6-digit number
    } while (await checkRandomExists(random));
    return random;
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const id = name;
      const dateTime = new Timestamp(Date.now() / 1000, 0);
      const username = await fetchUsername(user.uid);
      const key = await KeymanagementInstance.retrievemasterkey();

      if (!username) return;

      if (!name.trim()) {
        Alert.alert('Error', 'Pet name cannot be empty.');
        return;
      }
      const nid = await generateUniqueRandomNumber();
      let dataToStore = {};

      if (status === 'have_owner') {
        const encryptField = field =>
          CryptoJS.AES.encrypt(field, key).toString();

        dataToStore = {
          age: encryptField(age),
          weight: encryptField(weight),
          height: encryptField(height),
          characteristics: encryptField(characteristics),
          chronic: encryptField(chronic),
          location: encryptField(location),
          conditions: encryptField(conditions),
          color: encryptField(color),
          gender: encryptField(gender),
          birthday: encryptField(birthday.toISOString().substring(0, 10)),
          additionalImages,
        };
      } else {
        dataToStore = {
          age,
          weight,
          height,
          characteristics,
          chronic,
          location,
          conditions,
          color,
          gender,
          birthday: birthday.toISOString().substring(0, 10),
          adoptingConditions,
          additionalImages,
        };
      }

      const petDocRef = doc(db, 'Pets', name);
      await setDoc(petDocRef, {
        nid,
        id,
        breeds: breeds,
        uid: user.uid,
        username,
        name,
        ...dataToStore,
        type,
        dateTime,
        status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      if (imageP) {
        await uploadImage(imageP, petDocRef);
      }

      if (additionalImages.length > 0) {
        await uploadAdditionalImages(petDocRef);
      }
      setName('');
      setAge('');
      setBreeds('');
      setWeight('');
      setHeight('');
      setGender('');
      setColor('');
      setCharacteristics('');
      setChronic('');
      setLocation('');
      setConditions('');
      setBirthday(new Date());
      setAdoptingConditions('');
      setImageP(null);
      setAdditionalImages([]);
      setIsChecked(false);
      setStatus('have_owner');
      navigation.navigate('MyPets');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const onDateChange = selectedDate => {
    setDate(selectedDate);
    setBirthday(selectedDate);
    calculateAge(selectedDate);
  };

  const calculateAge = birthday => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      ).getDate();
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
    ]);
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

    const storageRef = ref(
      storage,
      `imageP/${user.uid}/pets/${name}/${Date.now()}`,
    );

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateDoc(petDocRef, { photoURL: downloadURL });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      console.error('Error uploading image: ', error);
    } finally {
      setUploading(false);
    }
  };

  const pickAdditionalImages = () => {
    Alert.alert('Select Additional Images', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          openAdditionalCamera();
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          openAdditionalImageLibrary();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openAdditionalImageLibrary = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 0,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAdditionalImages(prevImages => [
        ...prevImages,
        ...result.assets.map(asset => asset.uri),
      ]);
      Alert.alert('Success', 'Additional images uploaded successfully.');
    }
  };

  const openAdditionalCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAdditionalImages(prevImages => [
        ...prevImages,
        ...result.assets.map(asset => asset.uri),
      ]);
      Alert.alert('Success', 'Additional images uploaded successfully.');
    }
  };

  const uploadAdditionalImages = async (petDocRef) => {
    setUploading(true);
    try {
      const uploadedImageUrls = await Promise.all(
        additionalImages.map(async (uri) => {
          const storageRef = ref(storage, `images/${user.uid}/pets/${pet.name}/additional/${Date.now()}`);
          const response = await fetch(uri);
          const blob = await response.blob();
          const snapshot = await uploadBytes(storageRef, blob);
          return await getDownloadURL(snapshot.ref);
        })
      );

      await updateDoc(petDocRef, { additionalImages: uploadedImageUrls });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload additional images. Please try again.');
      console.error('Error uploading additional images: ', error);
    } finally {
      setUploading(false);
    }
  };

  const genderData = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Others', value: 'Others' },
  ];

  const typeData = [
    { label: 'Cat', value: 'Cat' },
    { label: 'Dog', value: 'Dog' },
    { label: 'Snake', value: 'Snake' },
    { label: 'Fish', value: 'Fish' },
    { label: 'Bird', value: 'Bird' },
    { label: 'Rabbit', value: 'Rabbit' },
    { label: 'Turtle', value: 'Turtle' },
    { label: 'Others', value: 'Other' },
  ];
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            style={styles.back}
            name="arrow-left"
            size={35}
            color="#D27C2C"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.screenTitle}>Add Pet</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.photoSec}>
            <View style={{ borderRadius: 100 }}>
              {imageP ? (
                <Image source={{ uri: imageP }} style={styles.image} />
              ) : (
                <MaterialCommunityIcons name="dog" size={120} color="#E16539" />
              )}
            </View>
            <TouchableOpacity onPress={pickImage}>
              <MaterialCommunityIcons
                style={styles.camera}
                name="camera-plus"
                size={30}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.container}>
            <View style={styles.subContainer}>
              <View style={styles.box2}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={'gray'}
                  value={name}
                  onChangeText={setName}
                />
                <Text style={styles.age}> Age :{age}</Text>
              </View>
              <View style={styles.box2}>
                <Dropdown
                  style={[styles.input, genderFocused && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  itemTextStyle={styles.itemTextStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={genderData}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!genderFocused ? 'Gender' : '...'}
                  value={gender}
                  onFocus={() => setGenderFocused(true)}
                  onBlur={() => setGenderFocused(false)}
                  onChange={item => {
                    setGender(item.value);
                    setGenderFocused(false);
                  }}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Color"
                  placeholderTextColor={'gray'}
                  value={color}
                  onChangeText={setColor}
                />
              </View>

              <Dropdown
                style={[styles.inputwh, typeFocused && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                itemTextStyle={styles.itemTextStyle}
                data={typeData}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!typeFocused ? 'Type' : '...'}
                value={type}
                onFocus={() => setTypeFocused(true)}
                onBlur={() => setTypeFocused(false)}
                onChange={item => {
                  setType(item.value);
                  setTypeFocused(false);
                }}
              />
              <TextInput
                style={styles.inputwh}
                placeholder="Breed"
                placeholderTextColor={'gray'}
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
              <View style={styles.box2}>
                <TextInput
                  style={styles.input}
                  placeholder="Weight (grams)"
                  placeholderTextColor={'gray'}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Height (cm)"
                  placeholderTextColor={'gray'}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
              <TextInput
                style={styles.inputwh}
                placeholder="Characteristics"
                placeholderTextColor={'gray'}
                value={characteristics}
                onChangeText={setCharacteristics}
              />
              <TextInput
                style={styles.inputwh}
                placeholder="Chronic Diseases"
                placeholderTextColor={'gray'}
                value={chronic}
                onChangeText={setChronic}
              />

              <View style={styles.additionalImagesContainer}>
                {additionalImages.length > 0 ? (
                  additionalImages.map((uri, index) => (
                    <View key={index} style={styles.additionalImageWrapper}>
                      <Image
                        key={index}
                        source={{ uri }}
                        style={styles.additionalImage}
                      />
                      <TouchableOpacity style={styles.deleteButton}
                        onPress={() => handleDeleteAdditionalImage(index)}>
                        <MaterialCommunityIcons name="close" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.additionalContainerNo}>
                    <TouchableOpacity
                      style={styles.additionalImagePicker}
                      onPress={pickAdditionalImages}>
                      <Text style={styles.additionalImagePickerText}>Add Images</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {userData?.verify ? (
                <>
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      text="Find Owner"
                      isChecked={isChecked}
                      onPress={() => {
                        setIsChecked(!isChecked);
                        setStatus(isChecked ? 'have_owner' : 'dont_have_owner');
                      }}
                    />
                  </View>
                    {isChecked && (
                      <>
                        <TextInput
                          style={styles.inputwh}
                          placeholder="Location"
                          placeholderTextColor={'gray'}
                          value={location}
                          onChangeText={setLocation}
                        />
                        <TextInput
                          style={styles.inputwh}
                          placeholder="Conditions"
                          placeholderTextColor={'gray'}
                          value={conditions}
                          onChangeText={setConditions}
                        />
                      </>
                    )}
                </>
              ) : null}
              <View style={[styles.buttonContainer, { marginBottom: 100 }]}>
                <CancelPButton onPress={() => navigation.navigate('MyPet')} />
                <SavePButton onPress={handleSubmit} />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};
const { width } = Dimensions.get('window');
const titleSize = width / 16;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  subContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
  },
  photoSec: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  screenTitle: {
    fontSize: titleSize,
    fontFamily: 'InterBold',
    color: '#D27C2C',
    paddingTop: 5,
  },
  box1: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  box2: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    width: '49%',
    fontFamily: 'InterRegular',
    padding: 10,
    margin: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    color: 'black',
  },
  age: {
    width: '49%',
    padding: 10,
    paddingTop: 15,
    fontFamily: 'InterRegular',
    margin: 5,
    marginBottom: 5,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderColor: '#E16539',
    color: 'black',
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
    fontFamily: 'InterRegular',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    color: 'black',
  },
  inputDate: {
    fontFamily: 'InterRegular',
    width: '90%',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    color: 'black',
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
    top: 10,
    left: -50,
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
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    marginVertical: 10,
  },
  additionalImagePicker: {
    backgroundColor: '#F0DFC8',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  additionalContainerNo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  additionalImagePickerText: {
    fontFamily: 'InterRegular',
  },
  additionalImage: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F0DFC8',
    borderRadius: 10,
    padding: 5,
  },
  dropdown: {
    height: 50,
    borderWidth: 0.2,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: 'black',
  },
  itemTextStyle: {
    color: 'gray',
  },
  back: {
    position: 'absolute',
    left: 20,
  },
  scrollViewContent: {
    paddingTop: 60,
  },
  tabBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '8%',
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default AddPet;
