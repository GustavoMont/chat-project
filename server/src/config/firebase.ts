import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxbWvfB65LniHepaOLMNe1jCxwqWoybGE",
  authDomain: "my-chat-fd229.firebaseapp.com",
  projectId: "my-chat-fd229",
  storageBucket: "my-chat-fd229.appspot.com",
  messagingSenderId: "1045832127484",
  appId: "1:1045832127484:web:6f4af607636de2b5b41879",
};
// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

export const storage = getStorage();
