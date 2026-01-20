// js/auth.js

// Botões e elementos do header
const loginIconBtn = document.getElementById('loginIconBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loggedInStatus = document.getElementById('loggedInStatus');

// Função segura para carregar as listas (com retry se elementos não existirem)
function iniciarAdmin() {
  const propostasLista = document.getElementById('propostasLista');
  const desativadosLista = document.getElementById('desativadosLista');

  if (!propostasLista || !desativadosLista) {
    console.warn("Elementos #propostasLista ou #desativadosLista ainda não estão no DOM. Tentando novamente em 500ms...");
    setTimeout(iniciarAdmin, 500);
    return;
  }

  console.log("Elementos encontrados. Carregando dados do admin...");

  if (typeof carregarPropostas === 'function') {
    carregarPropostas();
  } else {
    console.error("Função carregarPropostas não está definida");
  }

  if (typeof carregarDesativados === 'function') {
    carregarDesativados();
  } else {
    console.error("Função carregarDesativados não está definida");
  }
}

// Listener do botão de login (ícone)
if (loginIconBtn) {
  loginIconBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  });
}

// Listener do botão de logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
  });
}

// Monitora o estado de autenticação
auth.onAuthStateChanged((user) => {
  const loginScreen = document.getElementById('loginScreen');
  const adminContent = document.getElementById('adminContent');

  if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
    console.log("Login autorizado:", user.email);

    // Atualiza header: esconde ícone de login, mostra ícone logado + sair
    loginIconBtn.classList.add('hidden');
    loggedInStatus.classList.remove('hidden');

    // Mostra conteúdo admin
    loginScreen.classList.add('hidden');
    adminContent.classList.remove('hidden');

    // Carrega as listas com segurança
    setTimeout(iniciarAdmin, 800);

  } else if (user) {
    alert("Acesso negado: seu e-mail não tem permissão.");
    auth.signOut();
  } else {
    console.log("Usuário deslogado");

    // Volta ao estado inicial
    loginIconBtn.classList.remove('hidden');
    loggedInStatus.classList.add('hidden');

    loginScreen.classList.remove('hidden');
    adminContent.classList.add('hidden');
  }
});

// Caso a página seja carregada já com usuário logado (atualização ou cache)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    auth.getRedirectResult().catch(() => {}); // limpa redirect se houver
    // Verifica novamente o estado (útil em reload)
    auth.onAuthStateChanged((user) => {
      if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
        iniciarAdmin();
      }
    });
  }, 1000);
});