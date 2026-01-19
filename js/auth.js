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
    console.log("Login autorizado:", user.email);

    if (userEmailSpan) userEmailSpan.textContent = user.email;

    // Esconde login e mostra conteúdo
    const loginScreen = document.getElementById('loginScreen');
    const adminContent = document.getElementById('adminContent');
    if (loginScreen) loginScreen.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');

    // FORÇA O CARREGAMENTO DAS LISTAS
    setTimeout(() => {
      if (typeof carregarPropostas === 'function') {
        console.log("Carregando propostas...");
        carregarPropostas();
      } else {
        console.error("Função carregarPropostas não encontrada");
      }

      if (typeof carregarDesativados === 'function') {
        console.log("Carregando lojas desativadas...");
        carregarDesativados();
      } else {
        console.error("Função carregarDesativados não encontrada");
      }
    }, 500); // pequeno delay para garantir que o DOM está pronto

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