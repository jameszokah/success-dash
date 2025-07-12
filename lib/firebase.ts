import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import {  getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// const firebaseConfig = {
//   apiKey: "AIzaSyANH29_zjr83rdJLv4wdHDprRvENjE0HpY",
//   authDomain: "ghbay-a6024.firebaseapp.com",
//   projectId: "ghbay-a6024",
//   storageBucket: "ghbay-a6024.appspot.com",
//   messagingSenderId: "1060751239275",
//   appId: "1:1060751239275:web:0ba3d53016089522a1292e",
//   measurementId: "G-XE7B2Y9RDS"
// };


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
// connectAuthEmulator(auth, "http://127.0.0.1:9099");

const db = getFirestore(app);
// connectFirestoreEmulator(db, '127.0.0.1', 8080);

const storage = getStorage(app)

export { app, auth, db, storage }


