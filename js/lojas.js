// js/lojas.js

async function carregarDesativados() {
  const listaDiv = document.getElementById('desativadosLista');
  listaDiv.innerHTML = '<p style="text-align:center; color:#888;">Carregando...</p>';

  try {
    const snapshot = await db.collection('users')
      .where('anuncio.postagem', '==', false)
      .get();

    if (snapshot.empty) {
      listaDiv.innerHTML = '<p style="text-align:center; color:#888;">Nenhuma loja desativada.</p>';
      return;
    }

    listaDiv.innerHTML = '';

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="item-info">
          <h4>${data.nome || 'Sem nome'}</h4>
          <small>${data.descricao || 'Sem descrição'} • ${data.filiais ? data.filiais.length + ' filial(is)' : '1 filial'}</small>
        </div>
        <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); excluirLoja('${doc.id}')">Excluir</button>
      `;
      item.querySelector('.item-info').onclick = () => carregarParaEdicao({ id: doc.id, ...data, _colecao: 'users' });
      listaDiv.appendChild(item);
    });
  } catch (error) {
    listaDiv.innerHTML = '<p style="color:red;">Erro ao carregar.</p>';
    console.error(error);
  }
}

async function buscarLojas() {
  const termo = document.getElementById('buscaNome').value.trim().toLowerCase();
  if (!termo) return alert('Digite o nome');

  const resultadoDiv = document.getElementById('resultado');
  resultadoDiv.innerHTML = '<p style="text-align:center;">Buscando...</p>';

  try {
    const snapshot = await db.collection('users').get();
    resultadoDiv.innerHTML = '';
    let encontrou = false;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.nome && data.nome.toLowerCase().includes(termo)) {
        encontrou = true;
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
          <div class="item-info">
            <h4>${data.nome}</h4>
            <small>${data.filiais ? data.filiais.length + ' filial(is)' : '1 filial'}</small>
          </div>
        `;
        item.onclick = () => carregarParaEdicao({ id: doc.id, ...data, _colecao: 'users' });
        resultadoDiv.appendChild(item);
      }
    });

    if (!encontrou) resultadoDiv.innerHTML = '<p style="text-align:center;">Nenhuma loja encontrada.</p>';
  } catch (error) {
    resultadoDiv.innerHTML = '<p style="color:red;">Erro na busca.</p>';
    console.error(error);
  }
}

async function excluirLoja(id) {
  if (!confirm("Excluir permanentemente esta loja?")) return;
  try {
    await db.collection('users').doc(id).delete();
    alert("Loja excluída!");
    carregarDesativados();
  } catch (error) {
    alert("Erro: " + error.message);
  }
}

window.carregarDesativados = carregarDesativados;
window.buscarLojas = buscarLojas;
window.excluirLoja = excluirLoja;