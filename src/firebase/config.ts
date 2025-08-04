// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getDatabase, connectDatabaseEmulator, Database } from "firebase/database";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, connectAuthEmulator, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCju00DQK6fjVYaBZMCE-FXS21alpitL2U",
  authDomain: "quizninja-ae45d.firebaseapp.com",
  projectId: "quizninja-ae45d",
  storageBucket: "quizninja-ae45d.firebasestorage.app",
  messagingSenderId: "382180129048",
  appId: "1:382180129048:web:f8c507c5fc137ba973466d",
  measurementId: "G-4V4YPWWHRK"
};

// Initialize Firebase with error handling
let app: FirebaseApp | null = null;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase app:", error);
  app = null;
}

// Initialize Analytics (but not awaiting, will be null initially)
let analytics: Analytics | null = null;
isSupported().then(supported => {
  if (supported && app) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn("Failed to initialize analytics:", error);
    }
  }
}).catch(e => {
  console.warn("Analytics not supported in this environment", e);
});

// Initialize Firebase services with error handling
let db: Firestore | null = null;
let rtdb: Database | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (app) {
  try {
    db = getFirestore(app);
    rtdb = getDatabase(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // In development, you might want to use emulators
    if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
      // Uncomment these lines if you're using Firebase emulators
      // connectFirestoreEmulator(db, 'localhost', 8080);
      // connectAuthEmulator(auth, 'http://localhost:9099');
    }
  } catch (error) {
    console.error("Error initializing Firebase services:", error);
  }
}

export { app, analytics, db, rtdb, auth, googleProvider }; 