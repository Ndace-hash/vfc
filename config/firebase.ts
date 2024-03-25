// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const runtimeConfig = useRuntimeConfig();

const firebaseConfig = {
	apiKey: runtimeConfig.apiKey,
	authDomain: runtimeConfig.authDomain,
	projectId: runtimeConfig.projectId,
	storageBucket: runtimeConfig.storageBucket,
	messagingSenderId: runtimeConfig.messagingSenderId,
	appId: runtimeConfig.appId,
} as FirebaseOptions;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// initialize firestore
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
