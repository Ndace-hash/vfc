/**
 * import {onCall} from "firebase-functions/v2/https";
 */

const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const authApp = require("firebase-admin/auth");
exports.createAdmin = onCall(async (request) => {
	try {
		const email = request.data.email;
		const user = await authApp.getUserByEmail(email);
		authApp.setCustomUserClaims(user.uid, { admin: true });
		logger.info("successful");
	} catch (error) {
		console.error(error);
	}
});
