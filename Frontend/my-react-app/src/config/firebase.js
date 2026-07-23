// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1G6h9aq9wyynNDxJuWsnYwdJq_llAKMs",
  authDomain: "gen-lang-client-0887349477.firebaseapp.com",
  projectId: "gen-lang-client-0887349477",
  storageBucket: "gen-lang-client-0887349477.firebasestorage.app",
  messagingSenderId: "51176783378",
  appId: "1:51176783378:web:0d18319966013d0b3222cb",
  measurementId: "G-DM9K1X72WX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);