// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDtRKABGSdhQQaGMPHTdvMHVR__mEZOwzc",
    authDomain: "expense-tracking-system-8011.firebaseapp.com",
    projectId: "expense-tracking-system-8011",
    storageBucket: "expense-tracking-system-8011.appspot.com",
    messagingSenderId: "730011764448",
    appId: "1:730011764448:web:ab358b081868c3a09ab285",
    measurementId: "G-TXLMCVWG8B"
  };
  
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);