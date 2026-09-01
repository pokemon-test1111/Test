// Firebase Configuration
// Your Pokemon Gold Firebase Project

const firebaseConfig = {
  apiKey: "AIzaSyAerasympN1V2VyK-Xt8JeFUQNOQaFRz_o",
  authDomain: "pokemon-gold.firebaseapp.com",
  projectId: "pokemon-gold",
  storageBucket: "pokemon-gold.firebasestorage.app",
  messagingSenderId: "724744131728",
  appId: "1:724744131728:web:cb633dde53eee29f32b415",
  measurementId: "G-GRWQVBD6CW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
