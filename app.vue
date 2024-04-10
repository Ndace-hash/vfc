<template>
  <div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import type { FirebaseState } from '~/types/Firebase'

import { getDocs, where, query, collection } from 'firebase/firestore'
const valiant = useState('valiant')

const config = useRuntimeConfig()

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


const firebase = useState<FirebaseState>('firebase', () => {

  return {
    app,
    fireStore,
    storage,
    auth
  }
})


const q = query(collection(fireStore, 'clubs'), where('name', '==', 'Valiant FC'))
getDocs(q).then(snapshot => {
  const doc = snapshot.docs[0]

  valiant.value = { id: doc.id, logo: doc.data().logo, name: doc.data().name }
})

</script>