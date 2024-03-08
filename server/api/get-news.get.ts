import { getDocs, collection } from "firebase/firestore";
import { fireStore } from "../config/firebase2";

export default defineEventHandler(async () => {
	try {
		const data: any = [];
		const querySnapShot = await getDocs(collection(fireStore, "news"));
		querySnapShot.docs.forEach((doc) => {
			data.push({
				id: doc.id,
				...doc.data(),
			});
		});
		return data;
	} catch (error) {
		return error;
	}
});
