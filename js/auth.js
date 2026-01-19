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

// Função para carregar as listas (chamada só após DOM pronto e login)
function iniciarAdmin() {
  console.log("Iniciando painel admin...");
  if (typeof carregarPropostas === 'function') {
    carregarPropostas();
  } else {
    console.error("carregarPropostas não está definida");
  }
  if (typeof carregarDesativados === 'function') {
    carregarDesativados();
  } else {
    console.error("carregarDesativados não está definida");
  }
}

auth.onAuthStateChanged((user) => {
  if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
    console.log("Login autorizado:", user.email);

    if (userEmailSpan) userEmailSpan.textContent = user.email;

    const loginScreen = document.getElementById('loginScreen');
    const adminContent = document.getElementById('adminContent');

    if (loginScreen) loginScreen.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');

    // Agora chama o carregamento das listas
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

// Garante que o DOM está carregado antes de qualquer coisa (segurança extra)
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM carregado");
  // Se o usuário já estiver logado ao carregar a página, inicia o admin
  auth.onAuthStateChanged((user) => {
    if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
      iniciarAdmin();
    }
  });
});