import { fireStore, storage } from "../config/firebase2";
import {
	ref as storageRef,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const state = body.state;
	const inputFile = body.inputFile;
	const fileName = `${state.title.replaceAll(" ", "_")}.jpg`;
	if (inputFile.files !== null) {
		console.log(inputFile);
		// 	const clubRef = storageRef(storage, `news/${fileName}`);
		// 	uploadBytes(clubRef, inputFile.value!.files[0]).then((snapshot: any) => {
		// 		getDownloadURL(snapshot.ref)
		// 			.then((url) => {
		// 				state.bannerUrl = url;
		// 			})
		// 			.then(() => {
		// 				addDoc(collection(fireStore, "news"), {
		// 					...state,
		// 					publishedAt: Timestamp.now(),
		// 				}).then((snapshot) => {
		// 					console.log(snapshot);
		// 				});
		// 			});
		// 	});
	}
});
