import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "banzero-e711c.firebaseapp.com",
  databaseURL: "https://banzero-e711c-default-rtdb.firebaseio.com",
  projectId: "banzero-e711c",
  storageBucket: "banzero-e711c.firebasestorage.app",
  messagingSenderId: "434209682253",
  appId: "1:434209682253:web:e9d2b5a9e53c8c96333d04",
  measurementId: "G-9N84ZJCT0W"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };