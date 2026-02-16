// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBHD1ILq1TG9jPRqVBVojwRx40sKsr64qM',
  authDomain: 'design-lab-eb6ad.firebaseapp.com',
  projectId: 'design-lab-eb6ad',
  storageBucket: 'design-lab-eb6ad.firebasestorage.app',
  messagingSenderId: '991741653034',
  appId: '1:991741653034:web:78c8d2d24da7d33ab15353',
  measurementId: 'G-4PRGPBW9NC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
