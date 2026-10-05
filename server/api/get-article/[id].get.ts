import { getDoc, doc } from "firebase/firestore";
import { useFirebase } from "../../config/firebase2";

export default defineEventHandler(async (event) => {
	const { fireStore } = useFirebase();
	const id = getRouterParam(event, "id");
	try {
		const docRef = doc(fireStore, "news", id as string);
		const article = await getDoc(docRef);
		return {
			id: article.id,
			...article.data(),
		};
	} catch (error) {
		console.error(error);
		return error;
	}
});
