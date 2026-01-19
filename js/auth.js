import { firebaseConfig, ADMINS_PERMITIDOS } from './firebase-config.js';

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');

loginBtn?.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

logoutBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

auth.onAuthStateChanged((user) => {
  if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
    userEmailSpan.textContent = user.email;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
  } else if (user) {
    alert("Acesso negado.");
    auth.signOut();
  } else {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminContent').classList.add('hidden');
  }
});