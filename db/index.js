const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://stocks2.firebaseio.com",
});

const db = admin.firestore();

exports.db = db;
exports.admin = admin;