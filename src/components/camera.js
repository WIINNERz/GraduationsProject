import React, { useEffect, useState } from 'react';
import {
    Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../configs/firebaseConfig'; // Ensure storage is imported from your firebaseconfig



export const pickImage = (setImage) => {
    Alert.alert('Select Image', 'Choose an option', [
        { text: 'Camera', onPress: () => openCamera(setImage) },
        { text: 'Gallery', onPress: () => openImageLibrary(setImage) },
        { text: 'Cancel', style: 'cancel' },
    ]);
};
export const openImageLibrary = async (setImage) => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0, quality: 1 });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
        setImage(prevImages => [...prevImages, ...result.assets.map(asset => ({ uri: asset.uri }))]);
    }
};

export const openCamera = async (setImage) => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
        setImage(prevImages => [...prevImages, ...result.assets.map(asset => ({ uri: asset.uri }))]);
    }
};

export const uploadImage = async (uri, petDocRef) => {
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