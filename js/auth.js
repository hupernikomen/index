// js/auth.js

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
  });
}

auth.onAuthStateChanged((user) => {
  if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');

    // Carrega dados após login
    if (typeof carregarPropostas === 'function') carregarPropostas();
    if (typeof carregarDesativados === 'function') carregarDesativados();
  } else if (user) {
    alert("Acesso negado: seu e-mail não tem permissão.");
    auth.signOut();
  } else {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminContent').classList.add('hidden');
  }
});