async function carregarPropostas() {
  const listaDiv = document.getElementById('propostasLista');
  listaDiv.innerHTML = '<p style="text-align:center; color:#888;">Carregando...</p>';

  try {
    const snapshot = await db.collection('propostas').get();

    if (snapshot.empty) {
      listaDiv.innerHTML = '<p style="text-align:center; color:#888;">Nenhuma proposta pendente.</p>';
      return;
    }

    listaDiv.innerHTML = '';

    snapshot.forEach(doc => {
      const data = doc.data();
      const primeiraFilial = data.filiais?.[0] || {};
      const numeroWhats = primeiraFilial.whatsapp?.numero || 'Não informado';
      const bairro = primeiraFilial.bairro || 'Não informado';
      const descricao = data.descricao || 'Sem descrição';

      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="item-info">
          <h4>${data.nome || 'Sem nome'}</h4>
          <small>${descricao} • Whats: ${numeroWhats} • ${bairro}</small>
        </div>
      `;
      item.onclick = () => carregarParaEdicao({ id: doc.id, ...data, _colecao: 'propostas' });
      listaDiv.appendChild(item);
    });
  } catch (error) {
    listaDiv.innerHTML = '<p style="color:#c00;">Erro ao carregar.</p>';
    console.error(error);
  }
}

// Expor função globalmente
window.carregarPropostas = carregarPropostas;