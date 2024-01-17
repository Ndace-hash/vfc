// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// const firebaseConfig = {
// 	apiKey: process.env.API_KEY,
// 	authDomain: process.env.AUTH_DOMAIN,
// 	projectId: process.env.PROJECT_ID,
// 	storageBucket: process.env.STORAGE_BUCKET,
// 	messagingSenderId: process.env.MESSAGING_SENDER_ID,
// 	appId: process.env.APP_ID,
// };
const firebaseConfig = {
	apiKey: "AIzaSyCiKk72rfOWD3gvbFKjGYdbb0uCs4NwW80",
	authDomain: "valiant-fc-dev.firebaseapp.com",
	projectId: "valiant-fc-dev",
	storageBucket: "valiant-fc-dev.appspot.com",
	messagingSenderId: "641701082658",
	appId: "1:641701082658:web:64bd0879e02acc99c6fc7b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// initialize firestore
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
