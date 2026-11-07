
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCfiVebwnDLVyLV7qKZC3r3J-zL2IzLR7Y",
  authDomain: "chatsphere-3a360.firebaseapp.com",
  projectId: "chatsphere-3a360",
  databaseURL: "https://chatsphere-3a360-default-rtdb.asia-southeast1.firebasedatabase.app/",
  appId: "1:325174737855:web:86c4040df9a47f9b38bf0a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
