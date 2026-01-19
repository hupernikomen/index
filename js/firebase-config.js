const firebaseConfig = {
  apiKey: "AIzaSyDo0QQjxmXZLw8qiWC3Kc52ZYk9UtWCYmc",
  authDomain: "appguiacomercial-e6109.firebaseapp.com",
  projectId: "appguiacomercial-e6109",
  storageBucket: "appguiacomercial-e6109.appspot.com",
  messagingSenderId: "292734642765",
  appId: "1:292734642765:web:fc9d62106f1f72d4340a04"
};

const ADMINS_PERMITIDOS = ["hupcontato@gmail.com"];

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Expor globalmente
window.firebaseConfig = firebaseConfig;
window.ADMINS_PERMITIDOS = ADMINS_PERMITIDOS;
window.auth = auth;
window.db = db;