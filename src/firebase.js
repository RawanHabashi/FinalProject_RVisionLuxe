import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "rvision-luxe.firebaseapp.com",
  projectId: "rvision-luxe",
  storageBucket: "rvision-luxe.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);