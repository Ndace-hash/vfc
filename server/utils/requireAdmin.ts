import type { H3Event } from "h3";
import { useFirebase } from "../config/firebase2";

// Same rule the login page applies before letting someone into /admin
const OWNER_EMAIL = "japheth@valiantfc.com";

// Checks the Firebase ID token sent as `Authorization: Bearer <token>` and
// makes sure it belongs to an admin.
export const requireAdmin = async (event: H3Event) => {
	const token = getHeader(event, "authorization")?.match(/^Bearer (.+)$/i)?.[1];
	if (!token) {
		throw createError({ statusCode: 401, statusMessage: "Sign in required" });
	}

	const { authApp } = useFirebase();
	const user = await authApp.verifyIdToken(token).catch(() => {
		throw createError({
			statusCode: 401,
			statusMessage: "Your session has expired, sign in again",
		});
	});

	if (user.admin !== true && user.email !== OWNER_EMAIL) {
		throw createError({ statusCode: 403, statusMessage: "Admins only" });
	}
	return user;
};
