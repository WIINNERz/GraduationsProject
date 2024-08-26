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

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const firestore = getFirestore(app);
const storage = getStorage(app);

export const db = getFirestore(app);
export const usersRef = collection(db, 'Users');
export const petsRef = collection(db, 'Pets');
export const roomRef = collection(db, 'Rooms');

export { auth, firestore, storage };
