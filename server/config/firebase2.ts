// Import the functions you need from the SDKs you need
import { FirebaseOptions, initializeApp as clientApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth as clientAuth } from "firebase/auth";
import { ServiceAccount, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import serviceAccount from "~/valiant-fc-firebase-adminsdk-e6v1j-943d71199a.json";

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
export const auth = clientAuth(app);

const adminApp = initializeApp({
	credential: admin.credential.cert({
		clientEmail: runtimeConfig.adminClientEmail,
		privateKey: runtimeConfig.adminPrivateKey,
		projectId: runtimeConfig.adminProjectId,
	}),
});
export const authApp = getAuth(adminApp);
