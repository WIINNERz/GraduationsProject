// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
const auth = getAuth(app);
const firestore = getFirestore(app);
export  { auth, firestore };