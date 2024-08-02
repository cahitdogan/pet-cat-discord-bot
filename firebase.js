const { initializeApp } = require("firebase/app");
const { getFirestore, collection } = require("firebase/firestore/lite");

const firebaseConfig = {
  apiKey: "AIzaSyDVfNQFKUTK74rizLd-7QcCb74BKUFRRvI",
  authDomain: "virtual-pet-cat.firebaseapp.com",
  projectId: "virtual-pet-cat",
  storageBucket: "virtual-pet-cat.appspot.com",
  messagingSenderId: "314953086292",
  appId: "1:314953086292:web:dbfd1bb8c9d3d95a9e44c1",
  measurementId: "G-C0CD5P18P7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);

module.exports = {
  db
}
