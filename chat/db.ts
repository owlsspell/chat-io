//firebase
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DatabaseURL,
});

const db = getFirestore();

export default db.collection("chatCollection");
