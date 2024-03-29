// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: process.env.NUXT_API_KEY,
	authDomain: process.env.NUXT_AUTH_DOMAIN,
	projectId: process.env.NUXT_PROJECT_ID,
	storageBucket: process.env.NUXT_STORAGE_BUCKET,
	messagingSenderId: process.env.NUXT_MESSAGING_SENDER_ID,
	appId: process.env.APP_ID,
} as FirebaseOptions;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// initialize firestore
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
