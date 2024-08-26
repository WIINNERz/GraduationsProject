import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { auth, firestore, storage } from '../configs/firebaseConfig';

const handleDeleteAccount = async () => {
  try {
    const user = auth.currentUser;

    if (user) {
      // Delete user data from Firestore
      const userDocRef = firestore.collection('Users').doc(user.uid);
      await userDocRef.delete();

      // Try to delete user image from Firebase Storage
      try {
        const storageRef = storage.ref();
        const userImageRef = storageRef.child(`user_images/${user.uid}`);
        await userImageRef.delete();
      } catch (storageError) {
        // If the file does not exist, it will throw an error which can be ignored
        console.log('No image found to delete:', storageError.message);
      }

      // Delete the user account
      await user.delete();

      Alert.alert('Success', 'Your account has been deleted.');
    } else {
      Alert.alert('Error', 'No user is currently logged in.');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

export default function Settings() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleDeleteAccount}>
        <Text>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
