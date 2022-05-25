import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import { child, getDatabase, push, ref } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDbLhBwEswlzrQyEv_-rXCougoBomBjU5s",
  authDomain: "videoconf-b0aba.firebaseapp.com",
  databaseURL: "https://videoconf-b0aba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "videoconf-b0aba",
  storageBucket: "videoconf-b0aba.appspot.com",
  messagingSenderId: "579825820054",
  appId: "1:579825820054:web:39f0b677573816fd20fdb7",
  measurementId: "G-WS5BQ6TPRC"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
let firebaseRef = ref(db);

export const userName = prompt("what's your name? ");

const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");

if (roomId) {
  firebaseRef = child(firebaseRef, roomId);
} else {
  firebaseRef = push(firebaseRef);
  window.history.replaceState(null, "Rooms", "?id=" + firebaseRef.key);
}

export default firebaseRef
