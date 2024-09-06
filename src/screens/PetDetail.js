import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, storage } from '../configs/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackButton from '../components/backbutton';
import Checkbox from '../components/checkbox';
import CryptoJS from "rn-crypto-js";
import Keymanagement from '../components/Keymanagement';

const PetDetail = () => {
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState(new Date());
    const [age, setAge] = useState('');
    const [show, setShow] = useState(false);
    const [uploading, setUploading] = useState(false);
    const route = useRoute();
    const [image, setImage] = useState('');
    const [isFindHomeChecked, setIsFindHomeChecked] = useState(false);
    const user = auth.currentUser;
    const { id } = route.params;
    const navigation = useNavigation();
    const KeymanagementInstance = new Keymanagement(); 

    const onChange = (event, selectedDate) => {
        setShow(false);
        if (selectedDate) {
            setDate(selectedDate);
            setPet(prevState => ({
                ...prevState,
                birthday: selectedDate
            }));
            calculateAge(selectedDate);
        }
    };

    const onPress = () => {
        setIsFindHomeChecked(!isFindHomeChecked);
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

    useEffect(() => {
        const fetchPet = async () => {
            const key = await KeymanagementInstance.retrievemasterkey();
            try {
                const petDocRef = doc(db, 'Pets', id); // Use the correct document ID
                console.log('Document Reference:', petDocRef.path);
                const petDoc = await getDoc(petDocRef);
                if (petDoc.exists()) {
                    let petData = petDoc.data();
                    console.log('Fetched Pet Data:', petData);
                    if (petData.status === 'have_owner') {
                        petData = {
                            ...petData,
                            age: CryptoJS.AES.decrypt(petData.age, key).toString(CryptoJS.enc.Utf8),
                            breeds: CryptoJS.AES.decrypt(petData.breeds, key).toString(CryptoJS.enc.Utf8),
                            weight: CryptoJS.AES.decrypt(petData.weight, key).toString(CryptoJS.enc.Utf8),
                            height: CryptoJS.AES.decrypt(petData.height, key).toString(CryptoJS.enc.Utf8),
                            characteristics: CryptoJS.AES.decrypt(petData.characteristics, key).toString(CryptoJS.enc.Utf8),
                            chronic: CryptoJS.AES.decrypt(petData.chronic, key).toString(CryptoJS.enc.Utf8),
                            location: CryptoJS.AES.decrypt(petData.location, key).toString(CryptoJS.enc.Utf8),
                            conditions: CryptoJS.AES.decrypt(petData.conditions, key).toString(CryptoJS.enc.Utf8),
                            color: CryptoJS.AES.decrypt(petData.color, key).toString(CryptoJS.enc.Utf8),
                            gender: CryptoJS.AES.decrypt(petData.gender, key).toString(CryptoJS.enc.Utf8),
                        };
                    try {
                        // Add your decryption logic here
                    } catch (decryptErr) {
                        console.error('Decryption error:', decryptErr);
                        setError('Failed to decrypt pet data.');
                        return;
                    }
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
            const newId = pet.name;
            // Delete the old document
            await deleteDoc(doc(db, 'Pets', id));
            // Create a new document with the new ID
            await setDoc(doc(db, 'Pets', newId), {
                ...pet,
                id: newId,
                age: age,
                updatedAt: Timestamp.now(),
            });
            navigation.goBack();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Pet',
            'Are you sure you want to delete this pet?',
            [
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'Pets', pet.id));
                            navigation.goBack();
                        } catch (err) {
                            setError(err.message);
                        }
                    },
                },
                {
                    text: 'No',
                    style: 'cancel',
                },
            ]
        );
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
        const storageRef = ref(storage, `images/${user.uid}/pets/${pet.name}/${Date.now()}`);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const petDoc = doc(db, 'Pets', id);
            await updateDoc(petDoc, { photoURL: downloadURL });

            setPet(prevState => ({
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

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent} 
        style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="chevron-left" size={40} color="#E16539" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18 }}>Edit Pet Profile</Text>
        <Text></Text>
      </View>
            {pet?.photoURL ? (
                <Image source={{ uri: pet.photoURL }} style={styles.image} />
            ) : (
                <MaterialCommunityIcons name="account" size={50} color="gray" />
            )}
            <TouchableOpacity onPress={pickImage}>
                <View style={styles.camera} >
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
                    onChangeText={(text) => setPet({ ...pet, name: text })}
                />
            </View>
            <View style={styles.containerwh}>
                <Text>Age</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Age"
                    value={pet?.age || ''}
                    onChangeText={(text) => setPet({ ...pet, age: text })}
                />
            </View>
            </View>
                <Text>Breeds</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Breed"
                    value={pet?.breeds || ''}
                    onChangeText={(text) => setPet({ ...pet, breeds: text })}
                />
                <Text> Birthday </Text>
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
                            value={pet?.weight ? `${pet.weight} kg` : ''}
                            onChangeText={(text) => setPet({ ...pet, weight: parseFloat(text) }) }
                                />
                    </View>
                    <View style={styles.containerwh}>
                        <Text>Height</Text>
                        <TextInput
                            style={styles.inputwh}
                            placeholder="Height"
                            keyboardType="numeric"
                            value={pet?.height ? `${pet.height} cm` : ''}
                            onChangeText={(text) => setPet({ ...pet, height: parseFloat(text) }) }
                        />
                    </View>
                </View>
                <View style={styles.whContainer}>
                    <View style={styles.containerwh}>
                        <Text>Color</Text>
                        <TextInput
                            style={styles.inputwh}
                            placeholder="Color"
                            value={pet?.color ? `${pet.color}` : ''}
                            onChangeText={(text) => setPet({ ...pet, color: text })}
                                />
                    </View>
                    <View style={styles.containerwh}>
                        <Text>Gender</Text>
                        <TextInput
                            style={styles.inputwh}
                            placeholder="Gender"
                            value={pet?.gender ? `${pet.gender}` : ''}
                            onChangeText={(text) => setPet({ ...pet, gender: text })}
                        />
                    </View>
                </View>
                <View style={styles.whContainer}>
                    <View style={styles.container}>
                        <Text>Characteristics</Text>
                        <TextInput
                            style={styles.inputwh}
                            placeholder="Characteristics"
                            value={pet?.characteristics? `${pet.characteristics}` : ''}
                            onChangeText={(text) => setPet({ ...pet, characteristics: text })}
                                />
                    </View>
                    </View>
                    <View style={styles.whContainer}>
                    <View style={styles.container}>
                        <Text>Chronic</Text>
                        <TextInput
                            style={styles.inputwh}
                            placeholder="Chronic"
                            value={pet?.chronic? `${pet.chronic}` : ''}
                            onChangeText={(text) => setPet({ ...pet, chronic: text })}
                                />
                    </View>
                    </View>
                        <Checkbox
                            text="Find Home"
                            onPress={onPress}
                            isChecked={isFindHomeChecked}
                        />

                            {isFindHomeChecked && (
                                <View style={styles.adoptionDetailsContainer}>
                                <Text>Adopting Conditions</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Adopting Conditions"
                                />
                                </View>
                            )}
            </View>
                    {show && (
                        <DateTimePicker
                            mode="date"
                            display="default"
                            value={date || new Date()}
                            onChange={onChange}
                        />
                    )}

            
            <View style={styles.buttonPanel}>
            <TouchableOpacity style={styles.buttonS} onPress={() => handleSave()}>
                <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonD} onPress={() => handleDelete()}>
                <Text>Delete</Text>
            </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
            {uploading && <ActivityIndicator size="small" color="#0000ff" />}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewContent: {
        //flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //padding: 20,
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
        flexDirection: 'row',
        position: 'relative',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'white'
      },
});

export default PetDetail;
