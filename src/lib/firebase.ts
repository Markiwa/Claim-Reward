import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwd_0HgLDHF2vsQnWhn8ItBd20xt7ZbC4",
  authDomain: "visit-and-get.firebaseapp.com",
  projectId: "visit-and-get",
  storageBucket: "visit-and-get.firebasestorage.app",
  messagingSenderId: "249322078960",
  appId: "1:249322078960:web:16b3da146159ff30a93835"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
