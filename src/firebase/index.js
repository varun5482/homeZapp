import firebase from "firebase/app";
import 'firebase/storage';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBhma-76mC7y2nfrudDaq1RcYChoCmNmMg",
    authDomain: "homezapp-c9d09.firebaseapp.com",
    projectId: "homezapp-c9d09",
    storageBucket: "homezapp-c9d09.appspot.com",
    messagingSenderId: "512104666301",
    appId: "1:512104666301:web:4a0c1ff37b4c9a2ea3d3d4",
    measurementId: "G-DGPHBT4XS8"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();
const db = firebase.database();

export {storage,db, firebase as default};