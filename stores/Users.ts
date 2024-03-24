import { signInWithEmailAndPassword, type User, signOut } from "firebase/auth";
import { auth } from "~/config/firebase";
import type { LoginDetails } from "~/types/Auth";
export const useUserStore = defineStore("user", () => {
	const currentUser = ref<User | null>(null);

	const isAdmin = ref(false);
	const setUser = async (state: LoginDetails) => {
		try {
			await signInWithEmailAndPassword(auth, state.email, state.password).then(
				(userCredential) => {
					currentUser.value = userCredential.user;
				}
			);
		} catch (e) {
			console.error(e);
		}
	};
	const unSetUser = async () => {
		try {
			signOut(auth).then(() => {
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
