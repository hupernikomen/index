// js/auth.js

// Elementos do header
const loginIconBtn = document.getElementById('loginIconBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loggedInStatus = document.getElementById('loggedInStatus');

// Listener para o ícone de login
if (loginIconBtn) {
  loginIconBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  });
}

// Listener para logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
  });
}

// Função segura para carregar as listas (com retry se elementos não existirem)
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

// Monitora o estado de autenticação
auth.onAuthStateChanged((user) => {
  const loginScreen = document.getElementById('loginScreen');
  const adminContent = document.getElementById('adminContent');

  if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
    console.log("Login autorizado:", user.email);

    // Atualiza header: mostra status logado
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

// Caso a página seja recarregada com usuário já logado
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    auth.onAuthStateChanged((user) => {
      if (user && ADMINS_PERMITIDOS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
        iniciarAdmin();
      }
    });
  }, 1000);
});