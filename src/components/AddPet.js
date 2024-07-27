import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { getFirestore, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth ,storage } from '../configs/firebaseConfig';  // Ensure storage is imported from your firebaseconfig
import MyPet from './MyPet';

const AddPet = () => {
    const db = getFirestore();
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [type, setType] = useState('');
    const [image, setImage] = useState('');
    const [species, setSpecies] = useState('');
    const [uploading, setUploading] = useState(false);  // Added state for uploading

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
            const username = await fetchUsername(uid);
            if (!username) return;

            const petDocRef = doc(db, 'Pets', name);
            await setDoc(petDocRef, {
                uid,
                username,
                name,
                age,
                type,
                species
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

        const storageRef = ref(storage, `images/${user.uid}/pets/${name}/${Date.now()}`);

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
        <View style={styles.container}>
            <TextInput
                placeholder="Enter name"
                value={name}
                onChangeText={(value) => setName(value)}
            />
            <TextInput
                placeholder="Enter age"
                value={age}
                onChangeText={(value) => setAge(value)}
                keyboardType="numeric"
            />
            <TextInput
                placeholder="Enter type"
                value={type}
                onChangeText={(value) => setType(value)}
            />
            <TextInput
                placeholder="Enter species"
                value={species}
                onChangeText={(value) => setSpecies(value)}
            />
            <TouchableOpacity onPress={pickImage}>
                <MaterialCommunityIcons style={styles.camera} name="camera" size={30} color="#3A3A3A" />
            </TouchableOpacity>
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    camera: {
        margin: 10
    }
});

export default AddPet;
