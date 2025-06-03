// Import the functions you need from the SDKs you need
import { initializeApp,getApps  } from "firebase/app";
import { getFirestore  } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCLcM14N2xRqG4Uhj8VhYrvJ8mtlwZfNrc",
  authDomain: "twinmind-94d5d.firebaseapp.com",
  projectId: "twinmind-94d5d",
  storageBucket: "twinmind-94d5d.firebasestorage.app",
  messagingSenderId: "11230593000",
  appId: "1:11230593000:web:96dd2f8a7d7701f3616e5d",
  measurementId: "G-FSL0SDJ3T9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider, signInWithCredential };