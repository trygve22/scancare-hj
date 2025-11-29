import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration for ScanCare App
const firebaseConfig = {
  apiKey: "AIzaSyCf0Ait8UMto67PDnvC7JiQTAmLAomnkNo",
  authDomain: "scancare-app.firebaseapp.com",
  projectId: "scancare-app",
  storageBucket: "scancare-app.firebasestorage.app",
  messagingSenderId: "345198851761",
  appId: "1:345198851761:web:799626e094588862f55490"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
