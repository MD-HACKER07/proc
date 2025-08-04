// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCju00DQK6fjVYaBZMCE-FXS21alpitL2U",
  authDomain: "quizninja-ae45d.firebaseapp.com",
  projectId: "quizninja-ae45d",
  storageBucket: "quizninja-ae45d.firebasestorage.app",
  messagingSenderId: "382180129048",
  appId: "1:382180129048:web:f8c507c5fc137ba973466d",
  measurementId: "G-4V4YPWWHRK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
