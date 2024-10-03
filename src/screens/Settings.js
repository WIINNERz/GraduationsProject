import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import React from 'react';
import {auth, firestore, storage} from '../configs/firebaseConfig';
import {getFirestore, doc, deleteDoc} from 'firebase/firestore';
import {ref, deleteObject} from 'firebase/storage';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const handleDeleteAccount = async () => {
  try {
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();

      // Delete user data from Firestore
      const userDocRef = doc(db, 'Users', user.uid);
      await deleteDoc(userDocRef);

      // Try to delete user image from Firebase Storage
      try {
        const userImageRef = ref(storage, `user_images/${user.uid}`);
        await deleteObject(userImageRef);
      } catch (storageError) {
        // If the file does not exist, it will throw an error which can be ignored
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
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        style={styles.back}
        name="arrow-left"
        size={35}
        color="#D27C2C"
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.headerText}>Setting</Text>
      <View style={styles.tabButton}>
        <TouchableOpacity onPress={() => navigation.navigate('AccountInfo')}>
          <View style={styles.tabContent}>
            <MaterialCommunityIcons name="account" size={30} color="#D27C2C" />
            <View style={styles.tabText}>
              <Text style={styles.titleText}>Account Information</Text>
              <Text style={styles.descriptionText}>
                See your account information
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.tabButton}>
        <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
          <View style={styles.tabContent}>
            <MaterialCommunityIcons
              name="lock-reset"
              size={30}
              color="#D27C2C"
            />
            <View style={styles.tabText}>
              <Text style={styles.titleText}>Change Password</Text>
              <Text style={styles.descriptionText}>
                Send reset password link via your email
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.tabButton}>
        <TouchableOpacity onPress={() => navigation.navigate('Recovery')}>
          <View style={styles.tabContent}>
            <MaterialCommunityIcons
              name="account-reactivate"
              size={30}
              color="#D27C2C"
            />
            <View style={styles.tabText}>
              <Text style={styles.titleText}>Recovery your data</Text>
              <Text style={styles.descriptionText}>
                Recovery your data after you forget your password
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.tabButton}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Confirm Deletion',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  onPress: () => {
                    (async () => {
                      await handleDeleteAccount();
                    })();
                  },
                  style: 'destructive',
                },
              ],
              {cancelable: true},
            );
          }}>
          <View style={styles.tabContent}>
            <MaterialCommunityIcons
              name="account-off"
              size={30}
              color="#D27C2C"
            />
            <View style={styles.tabText}>
              <Text style={styles.titleText}>delete account</Text>
              <Text style={styles.descriptionText}>delete your account</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '5%',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabButton: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 5,
    marginVertical: 5,
    borderRadius: 10,
  },
  tabContent: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabText: {
    marginLeft: 10,
  },
  titleText: {
    fontSize: 18,
    fontFamily: 'InterBold',
  },
  descriptionText: {

    fontSize: 14,
    fontFamily: 'InterItalic',  
    color: 'black',
    opacity: 0.5,
    // marginTop: 5,
  },
  back: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 100,
    zIndex: 1,
  },
});
