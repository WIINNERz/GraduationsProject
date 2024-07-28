import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PetDetail = ({ navigation }) => {
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const route = useRoute();
    const [image, setImage] = useState('');
    const user = auth.currentUser;
    const { id } = route.params;

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const petDoc = await getDoc(doc(firestore, 'Pets', id));
                if (petDoc.exists()) {
                    setPet({ id: petDoc.id, ...petDoc.data() });
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
            await deleteDoc(doc(firestore, 'Pets', id));
            // Create a new document with the new ID
            await setDoc(doc(firestore, 'Pets', newId), { ...pet, id: newId });
            navigation.goBack();
        } catch (err) {
            setError(err.message);
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

        const storageRef = ref(storage, `images/${user.uid}/pets/${pet.name}/${Date.now()}`);

        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const snapshot = await uploadBytes(storageRef, blob);
            console.log('Uploaded a blob or file!');

            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at', downloadURL);

            const petDoc = doc(firestore, 'Pets', id);
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
        <View style={styles.container}>
            <Text style={styles.header}>Edit Pet</Text>
            {pet?.photoURL ? (
                <Image source={{ uri: pet.photoURL }} style={styles.image} />
            ) : (
                <MaterialCommunityIcons name="account" size={50} color="gray" />
            )}
            <TouchableOpacity onPress={pickImage}>
                <MaterialCommunityIcons style={styles.camera} name="camera" size={30} color="#3A3A3A" />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={pet?.name || ''}
                onChangeText={(text) => setPet({ ...pet, name: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={pet?.age ? pet.age.toString() : ''}
                onChangeText={(text) => setPet({ ...pet, age: parseInt(text, 10) })}
            />

            <Button title="Save" onPress={handleSave} />
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
            {uploading && <ActivityIndicator size="small" color="#0000ff" />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 100,
        borderWidth: 2,
    },
    camera: {
        marginBottom: 20,
    },
});

export default PetDetail;
