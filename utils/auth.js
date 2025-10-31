import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../database/firebase';

const CURRENT_USER_KEY = 'SCANCARE_CURRENT_USER';

// Register a new user with Firebase
export async function registerUser(email, password, name) {
  try {
    // Validate inputs
    if (!email || !password || !name) {
      return { success: false, message: 'Udfyld venligst alle felter' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password skal være mindst 6 tegn' };
    }

    // Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with name
    await updateProfile(userCredential.user, {
      displayName: name
    });

    const userSession = {
      id: userCredential.user.uid,
      email: userCredential.user.email,
      name: name
    };

    // Save to AsyncStorage for quick access
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));

    return { success: true, user: userSession };
  } catch (error) {
    console.error('Firebase registration error:', error);
    
    let message = 'Registrering fejlede';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email allerede registreret';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Ugyldig email adresse';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password er for svagt';
    }
    
    return { success: false, message };
  }
}

// Login user with Firebase
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const userSession = {
      id: userCredential.user.uid,
      email: userCredential.user.email,
      name: userCredential.user.displayName || 'Bruger'
    };

    // Save to AsyncStorage for quick access
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));

    return { success: true, user: userSession };
  } catch (error) {
    console.error('Firebase login error:', error);
    
    let message = 'Login fejlede';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      message = 'Forkert email eller password';
    } else if (error.code === 'auth/user-not-found') {
      message = 'Bruger ikke fundet';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Ugyldig email adresse';
    }
    
    return { success: false, message };
  }
}

// Logout user from Firebase
export async function logoutUser() {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  } catch (error) {
    console.error('Firebase logout error:', error);
    return { success: false };
  }
}

// Get current logged in user
export async function getCurrentUser() {
  try {
    // First check AsyncStorage for quick access
    const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }

    // Check Firebase auth state
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const userSession = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Bruger'
      };
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      return userSession;
    }

    return null;
  } catch (error) {
    console.error('Failed to get current user', error);
    return null;
  }
}

// Check if user is logged in
export async function isLoggedIn() {
  const user = await getCurrentUser();
  return user !== null;
}
