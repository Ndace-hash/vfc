import { signInWithEmailAndPassword, type User, signOut } from "firebase/auth";
import type { LoginDetails } from "~/types/Auth";
import { type FirebaseState } from "~/types/Firebase";

// const { auth } = useFirebaseSetup(useRuntimeConfig());
export const useUserStore = defineStore("user", () => {
	const firebase = useState<FirebaseState>("firebase");
	const currentUser = ref<User | null>(null);

	const isAdmin = ref(false);
	const setUser = async (state: LoginDetails) => {
		try {
			await signInWithEmailAndPassword(
				firebase.value.auth,
				state.email,
				state.password
			).then((userCredential) => {
				currentUser.value = userCredential.user;
			});
		} catch (e) {
			console.error(e);
		}
	};
	const unSetUser = async () => {
		try {
			signOut(firebase.value.auth).then(() => {
				currentUser.value = null;
			});
		} catch (e) {
			console.error(e);
		}
	};
	function $reset() {
		currentUser.value = null;
		isAdmin.value = false;
	}

	return { currentUser, setUser, unSetUser, isAdmin, $reset };
});
