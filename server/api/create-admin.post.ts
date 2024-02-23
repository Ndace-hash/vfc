import { authApp } from "../config/firebase2";
export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const user = await authApp.getUserByEmail(body.email);
		authApp.setCustomUserClaims(user.uid, { admin: true });

		return `${user.email} has been made an admin`;
	} catch (error) {
		console.error(error);
	}
});
