"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = void 0;
/**
 * import {onCall} from "firebase-functions/v2/https";
 */
const firebase2_1 = require("../../server/config/firebase2");
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
exports.createAdmin = (0, https_1.onCall)(async (request) => {
    try {
        const email = request.data.email;
        const user = await firebase2_1.authApp.getUserByEmail(email);
        firebase2_1.authApp.setCustomUserClaims(user.uid, { admin: true });
        logger.info("successful");
    }
    catch (error) {
        console.error(error);
    }
});
//# sourceMappingURL=index.js.map