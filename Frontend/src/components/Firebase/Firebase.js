/* eslint-disable no-undef */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"


const firebaseConfig = {
    apiKey: "AIzaSyCosreXmiQQZDykbXUw8NMY7btZAmPwOjc",
    authDomain: "wanderlust-47c1e.firebaseapp.com",
    projectId: "wanderlust-47c1e",
    storageBucket: "wanderlust-47c1e.appspot.com",
    messagingSenderId: "586869119269",
    appId: "1:586869119269:web:8ad8b487960c1fb2b922cc",
    measurementId: "G-9P0V2BSBYJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

export { app, auth }
