// Import the functions you need from the SDKs you need
import { type FirebaseOptions, initializeApp as clientApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth as clientAuth } from "firebase/auth";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const initFirebase = () => {
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

	const adminApp = initializeApp({
		credential: cert({
			clientEmail: runtimeConfig.adminClientEmail,
			privateKey: runtimeConfig.adminPrivateKey,
			projectId: runtimeConfig.adminProjectId,
		}),
	});

	return {
		// // initialize firestore
		fireStore: getFirestore(app),
		storage: getStorage(app),
		auth: clientAuth(app),
		authApp: getAuth(adminApp),
	};
};

let firebase: ReturnType<typeof initFirebase> | undefined;

// Initialised on first use, not on import: Nitro bundles this module into the
// server entry, so the server (and the build-time prerender) would otherwise
// need valid credentials just to start.
export const useFirebase = () => (firebase ??= initFirebase());
