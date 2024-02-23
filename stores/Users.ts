import { signInWithEmailAndPassword, type User, signOut } from "firebase/auth";
import { auth } from "~/config/firebase";
import type { LoginDetails } from "~/types/Auth";
import { useStorage } from "@vueuse/core";
export const useUserStore = defineStore("user", () => {
	const currentUser = ref<User | null>(null);
	const localUser = localStorage.getItem("currentUser");
	if (localUser) {
		currentUser.value = JSON.parse(localUser);
	}

	const isAdmin = ref(false);
	const setUser = async (state: LoginDetails) => {
		try {
			await signInWithEmailAndPassword(auth, state.email, state.password).then(
				(userCredential) => {
					currentUser.value = userCredential.user;
					localStorage.setItem(
						"currentUser",
						JSON.stringify(userCredential.user)
					);
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
