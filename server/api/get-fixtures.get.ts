import { fireStore } from "../config/firebase2";
import {
	getDocs,
	collection,
	query,
	where,
	orderBy,
	Timestamp,
} from "firebase/firestore";
export default defineEventHandler(async () => {
	const q1 = query(
		collection(fireStore, "fixtures"),
		where("date", ">=", Timestamp.now()),
		orderBy("date", "asc")
	);
	const q2 = query(
		collection(fireStore, "fixtures"),
		where("date", "<", Timestamp.now()),
		orderBy("date", "desc")
	);
	const futureGames = [] as any[];
	const pastGames = [] as any[];
	const querySnapshot1 = await getDocs(q1);
	querySnapshot1.docs.forEach((doc) => {
		futureGames.push({
			id: doc.id,
			...doc.data(),
		});
	});
	const querySnapshot2 = await getDocs(q2);
	querySnapshot2.docs.forEach((doc) => {
		pastGames.push({
			id: doc.id,
			...doc.data(),
		});
	});

	return [futureGames, pastGames];
});
