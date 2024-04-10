// import { useUserStore } from "~/stores/Users";
import { type FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { type FirebaseState } from "~/types/Firebase";

export default defineNuxtRouteMiddleware((to, from) => {
	const config = useRuntimeConfig();
	const firebase = useState<FirebaseState>("firebase");

	if (!firebase.value) {
		const firebaseConfig = {
			apiKey: config.public.apiKey,
			authDomain: config.public.authDomain,
			projectId: config.public.projectId,
			storageBucket: config.public.storageBucket,
			messagingSenderId: config.public.messagingSenderId,
			appId: config.public.appId,
		} as FirebaseOptions;

		// Initialize Firebase
		const app = initializeApp(firebaseConfig);

		// initialize firestore
		const fireStore = getFirestore(app);
		const storage = getStorage(app);
		const auth = getAuth(app);

		useState<FirebaseState>("firebase", () => {
			return {
				app,
				fireStore,
				storage,
				auth,
			};
		});
	}
	// Import the functions you need from the SDKs you need
	// const firebase = useState<FirebaseState>("firebase");
	if (to.meta.layout == "admin" && !firebase.value.auth.currentUser) {
		return navigateTo("/admin/login");
	}
});
