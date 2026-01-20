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

// Função segura para carregar as listas
function iniciarAdmin() {
  const propostasLista = document.getElementById('propostasLista');
  const desativadosLista = document.getElementById('desativadosLista');

  if (!propostasLista || !desativadosLista) {
    console.warn("Elementos ainda não estão no DOM. Tentando novamente em 500ms...");
    setTimeout(iniciarAdmin, 500);
    return;
  }

  console.log("Elementos encontrados. Carregando dados...");

  if (typeof carregarPropostas === 'function') {
    carregarPropostas();
  } else {
    console.error("carregarPropostas não definida");
  }

  if (typeof carregarDesativados === 'function') {
    carregarDesativados();
  } else {
    console.error("carregarDesativados não definida");
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

    // Aguarda um pouco mais e tenta carregar
    setTimeout(iniciarAdmin, 800);

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

// Caso o usuário já esteja logado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    auth.onAuthStateChanged((user) => {
      if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
        iniciarAdmin();
      }
    });
  }, 1000);
});