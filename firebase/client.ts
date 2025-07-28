import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBkOk5slGGW7LssCmmntH2WisEdxkjHfs",
  authDomain: "preptime-f0f94.firebaseapp.com",
  projectId: "preptime-f0f94",
  storageBucket: "preptime-f0f94.firebasestorage.app",
  messagingSenderId: "331131956807",
  appId: "1:331131956807:web:128d0d9b3404d9ceea0b62",
  measurementId: "G-Q90RDWF8MJ"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)