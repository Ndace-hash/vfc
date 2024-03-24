"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApp = exports.storage = exports.fireStore = void 0;
// Import the functions you need from the SDKs you need
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const runtimeConfig = useRuntimeConfig();
const firebaseConfig = {
    apiKey: runtimeConfig.apiKey,
    authDomain: runtimeConfig.authDomain,
    projectId: runtimeConfig.projectId,
    storageBucket: runtimeConfig.storageBucket,
    messagingSenderId: runtimeConfig.messagingSenderId,
    appId: runtimeConfig.appId,
};
// // Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
// // initialize firestore
exports.fireStore = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
const app_2 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const adminApp = (0, app_2.initializeApp)();
exports.authApp = (0, auth_1.getAuth)(adminApp);
//# sourceMappingURL=firebase2.js.map