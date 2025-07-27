// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);