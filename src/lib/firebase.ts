import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase with proper error handling
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase initialization error:', error);
  }
  app = initializeApp(firebaseConfig, `utilx-${Date.now()}`);
}

const auth = getAuth(app);

export { auth, onAuthStateChanged };

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get the token and store it in localStorage for API requests
    const token = await userCredential.user.getIdToken();
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    
    return userCredential.user;
  } catch (error: any) {
    // Provide more detailed error messages based on Firebase auth error codes
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid login credentials. Please check your email and password.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many unsuccessful login attempts. Please try again later.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('The email address is not valid.');
    } else {
      console.error('Firebase auth error:', error);
      throw new Error(`Authentication error: ${error.message}`);
    }
  }
};

export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Get the token and store it in localStorage for API requests
  const token = await userCredential.user.getIdToken();
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
  
  return userCredential.user;
};

export const signOut = async () => {
  // Clear the token from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
  
  return await firebaseSignOut(auth);
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Get a fresh token for the current user
export const refreshToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const token = await getIdToken(user, true); // Force refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
