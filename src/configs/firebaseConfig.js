// src/configs/firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { getFirestore,collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDje74xykIZh6uCMGolDMcfNv4Tc5KuLRk",
  authDomain: "graduationspj.firebaseapp.com",
  projectId: "graduationspj",
  storageBucket: "graduationspj.appspot.com",
  messagingSenderId: "452497966669",
  appId: "1:452497966669:web:642f2118703c5050653e04"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
const firestore = firebase.firestore();

export { auth, firestore ,storage};
export const db = getFirestore(app);
export const usersRef = collection(db,'Users');
export const roomRef = collection(db,'Rooms');
