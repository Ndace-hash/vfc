import { getDocs, collection, limit, orderBy, query } from "firebase/firestore";
import { fireStore } from "../config/firebase2";

export default defineEventHandler(async () => {
	try {
		const q = query(
			collection(fireStore, "news"),
			orderBy("publishedAt", "desc"),
			limit(10)
		);
		const data: any = [];
		const querySnapShot = await getDocs(q);
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
