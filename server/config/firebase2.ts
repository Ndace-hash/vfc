// Import the functions you need from the SDKs you need
import { FirebaseOptions, initializeApp as clientApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const runtimeConfig = useRuntimeConfig();

const firebaseConfig = {
	apiKey: runtimeConfig.apiKey,
	authDomain: runtimeConfig.authDomain,
	projectId: runtimeConfig.projectId,
	storageBucket: runtimeConfig.storageBucket,
	messagingSenderId: runtimeConfig.messagingSenderId,
	appId: runtimeConfig.appId,
} as FirebaseOptions;

// // Initialize Firebase
const app = clientApp(firebaseConfig);

// // initialize firestore
export const fireStore = getFirestore(app);
export const storage = getStorage(app);

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
const adminApp = initializeApp();
export const authApp = getAuth(adminApp);
