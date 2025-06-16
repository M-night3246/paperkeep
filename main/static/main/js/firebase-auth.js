import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
// import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
// } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase and Auth service
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Track user login state globally
window.isUserLoggedIn = false;

// Auth state listener - updates homepage button text dynamically
onAuthStateChanged(auth, (user) => {
  window.isUserLoggedIn = !!user;

  // On homepage, swap button text
  const authBtn = document.getElementById("auth-btn");
  if (authBtn) {
    authBtn.textContent = user ? "Logout" : "Sign Up";
  }
});

// Sign up function
window.firebaseSignUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login function
window.firebaseLogin = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout function
window.logoutUser = () => {
  signOut(auth).then(() => {
    window.location.href = "/"; // Reload homepage on logout
  });
};

console.log("✅ firebase-auth.js loaded");
console.log("🧪 firebaseSignUp:", typeof window.firebaseSignUp);
console.log("🧪 logoutUser:", typeof window.logoutUser);