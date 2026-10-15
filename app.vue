<template>
	<UApp>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>

<script setup lang="ts">
	import {
		initializeApp,
		type FirebaseApp,
		type FirebaseOptions,
	} from "firebase/app";
	import { Firestore, getFirestore } from "firebase/firestore";
	import { getStorage, type FirebaseStorage } from "firebase/storage";
	import { getAuth } from "firebase/auth";
	import type { FirebaseState } from "~/types/Firebase";

	const config = useRuntimeConfig();

	// Import the functions you need from the SDKs you need
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

	const firebase = useState<FirebaseState>("firebase", () => {
		return {
			app,
			fireStore,
			storage,
			auth,
		};
	});
</script>
