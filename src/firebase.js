// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChm3GqO_tSWcpTyIs8C9ib8TVFITmUa5Q",
  authDomain: "kafi-931ef.firebaseapp.com",
  projectId: "kafi-931ef",
  storageBucket: "kafi-931ef.firebasestorage.app",
  messagingSenderId: "391360612894",
  appId: "1:391360612894:web:4cc5652f386386b618fc0f",
  measurementId: "G-XPMFQCYR01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase Connected Successfully!");
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics };
export default app;

