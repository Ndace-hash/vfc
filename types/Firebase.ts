import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

export interface FirebaseState {
	app: FirebaseApp;
	fireStore: Firestore;
	storage: FirebaseStorage;
	auth: Auth;
}
