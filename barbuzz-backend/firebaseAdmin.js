const admin = require('firebase-admin');
const serviceAccount = require('./barbuzz-29b1a-firebase-adminsdk-srfma-75e610b615.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { db };
