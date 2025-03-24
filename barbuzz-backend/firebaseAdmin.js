const admin = require('firebase-admin');
const serviceAccountJson = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJson),
});


const db = admin.firestore();
module.exports = { db };
