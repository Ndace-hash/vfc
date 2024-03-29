// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: process.env.API_KEY || "AIzaSyCiKk72rfOWD3gvbFKjGYdbb0uCs4NwW80",
	authDomain: process.env.AUTH_DOMAIN || "valiant-fc-dev.firebaseapp.com",
	projectId: process.env.PROJECT_ID || "valiant-fc-dev",
	storageBucket: process.env.STORAGE_BUCKET || "valiant-fc-dev.appspot.com",
	messagingSenderId: process.env.MESSAGING_SENDER_ID || "641701082658",
	appId: process.env.APP_ID || "1:641701082658:web:64bd0879e02acc99c6fc7b",
} as FirebaseOptions;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// initialize firestore
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
