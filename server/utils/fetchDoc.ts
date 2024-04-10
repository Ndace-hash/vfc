import { DocumentData, collection, getDocs } from "firebase/firestore";
import { fireStore } from "../config/firebase2";

interface ObjectParameter {
	collectionRef: string;
}
export default async function (object: ObjectParameter) {
	const { collectionRef } = object;
	const data = [] as DocumentData[];
	let error = null;
	try {
		const snapshot = await getDocs(collection(fireStore, collectionRef));
		snapshot.docs.forEach((doc) => {
			data.push({
				id: doc.id,
				...doc.data(),
			});
		});
	} catch (err) {
		error = err;
	}

	return {
		data,
		error,
	};
}
