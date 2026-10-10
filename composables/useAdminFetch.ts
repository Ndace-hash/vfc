import type { FirebaseState } from "~/types/Firebase";

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>;

// $fetch for the /api/admin routes: sends the signed-in admin's Firebase ID
// token so the server can check who is calling.
export const useAdminFetch = () => {
	const firebase = useState<FirebaseState>("firebase");

	return async <T>(url: string, options: FetchOptions = {}) => {
		const token = await firebase.value.auth.currentUser?.getIdToken();
		return $fetch<T>(url, {
			...options,
			headers: { ...options.headers, Authorization: `Bearer ${token}` },
		});
	};
};

// Pulls the readable message out of a failed $fetch
export const fetchErrorMessage = (error: unknown) => {
	const failure = error as {
		data?: { message?: string; statusMessage?: string };
		statusMessage?: string;
		message?: string;
	};
	return (
		failure?.data?.message ||
		failure?.data?.statusMessage ||
		failure?.statusMessage ||
		failure?.message ||
		"Something went wrong"
	);
};
