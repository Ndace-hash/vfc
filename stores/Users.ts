import { signInWithEmailAndPassword, type User } from "firebase/auth";
import { auth } from "~/config/firebase";
import type { LoginDetails } from "~/types/Auth";
import { useStorage } from "@vueuse/core";
export const useUserStore = defineStore("user", () => {
	const currentUser = useStorage<User>("currentUser", null);

	const setUser = async (state: LoginDetails) => {
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				state.email,
				state.password
			);
			currentUser.value = userCredential.user;
		} catch (e) {
			console.error(e);
		}
	};

	return { currentUser, setUser };
});
