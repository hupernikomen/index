// js/auth.js

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn'); // Agora está dentro do dropdown

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

// Função para carregar as listas (chamada só após DOM pronto e login)
function iniciarAdmin() {
  console.log("Iniciando painel admin...");
  if (typeof carregarPropostas === 'function') {
    carregarPropostas();
  }
  if (typeof carregarDesativados === 'function') {
    carregarDesativados();
  }
}

auth.onAuthStateChanged((user) => {
  if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
    console.log("Login autorizado:", user.email);

    const loginScreen = document.getElementById('loginScreen');
    const adminContent = document.getElementById('adminContent');

    if (loginScreen) loginScreen.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');

    iniciarAdmin();

  } else if (user) {
    alert("Acesso negado: seu e-mail não tem permissão.");
    auth.signOut();
  } else {
    console.log("Usuário deslogado");
    const loginScreen = document.getElementById('loginScreen');
    const adminContent = document.getElementById('adminContent');
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (adminContent) adminContent.classList.add('hidden');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM carregado");
});