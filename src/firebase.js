// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtg3yYbyTBMG639SxK4tdT48e6OxJlHaY",
  authDomain: "trip-planner-3ce81.firebaseapp.com",
  projectId: "trip-planner-3ce81",
  storageBucket: "trip-planner-3ce81.firebasestorage.app",
  messagingSenderId: "906660632784",
  appId: "1:906660632784:web:640055c14360f3c35166d5",
  measurementId: "G-FW3ZDZNPXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);