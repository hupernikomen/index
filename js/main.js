import { db } from './auth.js';
import { carregarPropostas } from './propostas.js';
import { carregarDesativados } from './lojas.js';

function toggleSubfields(tipo) {
  const fields = document.getElementById(tipo + 'Fields');
  const checked = document.getElementById(tipo + 'Ativo').checked;
  fields.classList.toggle('hidden', !checked);
}

window.carregarParaEdicao = function(item) {
  document.getElementById('formAtualizacao').classList.remove('hidden');
  document.getElementById('nomeLojaAtual').textContent = item.nome || 'Sem nome';
  document.getElementById('fonteItem').textContent = item._colecao === 'propostas' ? '(Proposta)' : '(Loja)';
  document.getElementById('lojaId').value = item.id;
  document.getElementById('colecaoOrigem').value = item._colecao || 'users';

  document.getElementById('nome').value = item.nome || '';
  document.getElementById('descricao').value = item.descricao || '';
  document.getElementById('tags').value = Array.isArray(item.tags) ? item.tags.join(', ') : '';

  document.getElementById('anuncioBusca').checked = item.anuncio?.busca === true;
  document.getElementById('anuncioPostagem').checked = item.anuncio?.postagem !== false;
  document.getElementById('anuncioPremium').checked = item.anuncio?.premium === true;

  const filial = item.filiais?.[0] || {};
  const horarios = filial.horarios || {};

  document.getElementById('bairro').value = filial.bairro || '';
  document.getElementById('endereco').value = filial.endereco || '';
  document.getElementById('whatsapp').value = filial.whatsapp?.numero || '';
  document.getElementById('fazEntrega').checked = filial.fazEntrega === true;

  document.getElementById('semanaAbre').value = horarios.semana?.abre || '';
  document.getElementById('semanaFecha').value = horarios.semana?.fecha || '';

  const sabadoAtivo = !!horarios.sabado;
  document.getElementById('sabadoAtivo').checked = sabadoAtivo;
  document.getElementById('sabadoAbre').value = horarios.sabado?.abre || '';
  document.getElementById('sabadoFecha').value = horarios.sabado?.fecha || '';
  toggleSubfields('sabado');

  const domingoAtivo = !!horarios.domingo;
  document.getElementById('domingoAtivo').checked = domingoAtivo;
  document.getElementById('domingoAbre').value = horarios.domingo?.abre || '';
  document.getElementById('domingoFecha').value = horarios.domingo?.fecha || '';
  toggleSubfields('domingo');

  const intervaloAtivo = horarios.intervalo?.global === true;
  document.getElementById('intervaloAtivo').checked = intervaloAtivo;
  document.getElementById('intervaloInicio').value = horarios.intervalo?.inicio || '';
  document.getElementById('intervaloRetorno').value = horarios.intervalo?.retorno || '';
  toggleSubfields('intervalo');

  document.getElementById('formAtualizacao').scrollIntoView({ behavior: 'smooth' });
};

window.atualizarLoja = async function() {
  const id = document.getElementById('lojaId').value;
  const colecao = document.getElementById('colecaoOrigem').value;
  const isProposta = colecao === 'propostas';

  const tagsArray = document.getElementById('tags').value.trim()
    ? document.getElementById('tags').value.trim().split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const numeroWhats = document.getElementById('whatsapp').value.trim();
  const bairro = document.getElementById('bairro').value.trim();
  const endereco = document.getElementById('endereco').value.trim();

  if (isProposta && (!numeroWhats || !bairro)) {
    return alert('WhatsApp e Bairro são obrigatórios.');
  }

  const horarios = {
    semana: {
      abre: document.getElementById('semanaAbre').value.trim() || '08:00',
      fecha: document.getElementById('semanaFecha').value.trim() || '18:00',
    },
    intervalo: {
      global: document.getElementById('intervaloAtivo').checked,
      inicio: document.getElementById('intervaloInicio').value.trim() || null,
      retorno: document.getElementById('intervaloRetorno').value.trim() || null,
    },
  };

  if (document.getElementById('sabadoAtivo').checked) {
    horarios.sabado = {
      abre: document.getElementById('sabadoAbre').value.trim() || '08:00',
      fecha: document.getElementById('sabadoFecha').value.trim() || '12:00',
    };
  }

  if (document.getElementById('domingoAtivo').checked) {
    horarios.domingo = {
      abre: document.getElementById('domingoAbre').value.trim() || '09:00',
      fecha: document.getElementById('domingoFecha').value.trim() || '12:00',
    };
  }

  const novaFilial = {
    whatsapp: { numero: numeroWhats, principal: true },
    bairro: bairro,
    endereco: endereco || null,
    fazEntrega: document.getElementById('fazEntrega').checked,
    horarios: horarios
  };

  const dadosGerais = {
    nome: document.getElementById('nome').value.trim() || 'Sem nome',
    descricao: document.getElementById('descricao').value.trim(),
    tags: tagsArray,
    anuncio: {
      busca: document.getElementById('anuncioBusca').checked,
      postagem: document.getElementById('anuncioPostagem').checked,
      premium: document.getElementById('anuncioPremium').checked
    }
  };

  try {
    if (!isProposta) {
      await db.collection('users').doc(id).update({
        ...dadosGerais,
        filiais: [novaFilial]
      });
      alert('Loja atualizada!');
    } else {
      const batch = db.batch();
      const novaLojaRef = db.collection('users').doc(id);

      batch.set(novaLojaRef, {
        ...dadosGerais,
        filiais: [novaFilial],
        temFiliais: false,
        clicks: 0,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });

      batch.delete(db.collection('propostas').doc(id));

      await batch.commit();
      alert('Loja criada com sucesso!');
      carregarPropostas();
    }
    cancelarEdicao();
  } catch (error) {
    console.error(error);
    alert('Erro: ' + error.message);
  }
};

function cancelarEdicao() {
  document.getElementById('formAtualizacao').classList.add('hidden');
  document.getElementById('resultado').innerHTML = '';
}

window.cancelarEdicao = cancelarEdicao;

// Inicializa após login
document.addEventListener('DOMContentLoaded', () => {
  // As funções de carregamento são chamadas no auth.js após login
});