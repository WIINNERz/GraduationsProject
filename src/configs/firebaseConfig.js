import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDje74xykIZh6uCMGolDMcfNv4Tc5KuLRk",
  authDomain: "graduationspj.firebaseapp.com",
  projectId: "graduationspj",
  storageBucket: "graduationspj.appspot.com",
  messagingSenderId: "452497966669",
  appId: "1:452497966669:web:642f2118703c5050653e04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Optionally, if you need to use `getAuth` for other purposes, you can do so like this:
const authInstance = getAuth(app);

// Initialize Firestore and Storage
const firestore = getFirestore(app);
const storage = getStorage(app);

// References to collections
export const usersRef = collection(firestore, 'Users');
export const petsRef = collection(firestore, 'Pets');
export const roomRef = collection(firestore, 'Rooms');

// Export services for use in other parts of your app
export { auth, firestore, storage };
