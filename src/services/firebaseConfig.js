// Import the functions you need from the SDKs you need
import { initializeApp,getApps  } from "firebase/app";
import { getFirestore  } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider, signInWithCredential };