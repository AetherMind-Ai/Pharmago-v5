import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth'; // Import getAuth

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Add Realtime Database URL if it's not the default
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app); // Initialize Firebase Auth

export { app, db, rtdb, auth }; // Export app, db, rtdb, and auth
