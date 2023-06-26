import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD3HuQ9bed3OOf2cs9_0H5YgXKmwiM5FK0",
  authDomain: "my-chat-bf095.firebaseapp.com",
  projectId: "my-chat-bf095",
  storageBucket: "my-chat-bf095.appspot.com",
  messagingSenderId: "1055657858604",
  appId: "1:1055657858604:web:6b13f3619d0914dd6de389",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

export const storage = getStorage();
