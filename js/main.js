// js/main.js

// Função principal para alternar o modo de horário (não informa vs. define horários)
function toggleModoHorario(modo) {
  const container = document.getElementById('containerHorariosDetalhados');

  if (modo === 'naoInforma') {
    container.classList.add('disabled');
    // Limpa todos os campos de horário
    document.querySelectorAll('#containerHorariosDetalhados input[type=text]').forEach(i => i.value = '');
    document.querySelectorAll('#containerHorariosDetalhados input[type=checkbox]').forEach(i => i.checked = false);
    document.querySelectorAll('.sub-campos').forEach(el => el.classList.add('hidden'));
  } else {
    container.classList.remove('disabled');
  }
}

// Toggle intervalo global (almoço)
function toggleIntervaloGlobal() {
  const ativo = document.getElementById('intervaloGlobalAtivo').checked;
  const campos = document.getElementById('intervaloGlobalCampos');
  campos.classList.toggle('hidden', !ativo);
}

// Toggle campos de Sábado ou Domingo
function toggleDiaIndividual(dia) {
  const ativo = document.getElementById(dia + 'Ativo').checked;
  const campos = document.getElementById(dia + 'Campos');
  campos.classList.toggle('hidden', !ativo);
}

// Carrega os dados da loja/proposta no formulário de edição
function carregarParaEdicao(item) {
  document.getElementById('formAtualizacao').classList.remove('hidden');
  document.getElementById('nomeLojaAtual').textContent = item.nome || 'Sem nome';
  document.getElementById('fonteItem').textContent = item._colecao === 'propostas' ? '(Proposta)' : '(Loja)';
  document.getElementById('lojaId').value = item.id;
  document.getElementById('colecaoOrigem').value = item._colecao || 'users';

  // Dados gerais
  document.getElementById('nome').value = item.nome || '';
  document.getElementById('descricao').value = item.descricao || '';
  document.getElementById('tags').value = Array.isArray(item.tags) ? item.tags.join(', ') : '';

  // Anúncios
  document.getElementById('anuncioBusca').checked = item.anuncio?.busca === true;
  document.getElementById('anuncioPostagem').checked = item.anuncio?.postagem !== false;
  document.getElementById('anuncioPremium').checked = item.anuncio?.premium === true;

  // Dados da filial (primeira filial)
  const filial = item.filiais?.[0] || {};
  const horarios = filial.horarios || {};

  document.getElementById('bairro').value = filial.bairro || '';
  document.getElementById('endereco').value = filial.endereco || '';
  document.getElementById('whatsapp').value = filial.whatsapp?.numero || '';
  document.getElementById('fazEntrega').checked = filial.fazEntrega === true;

  // === Lógica de horários ===
  const naoInforma = !horarios.informar || horarios.informar === undefined;

  if (naoInforma) {
    document.getElementById('naoInformaHorarioRadio').checked = true;
    toggleModoHorario('naoInforma');
  } else {
    document.getElementById('defineHorarioRadio').checked = true;
    toggleModoHorario('define');

    // Intervalo global
    const intervaloGlobal = horarios.intervaloGlobal || {};
    document.getElementById('intervaloGlobalAtivo').checked = intervaloGlobal.ativo === true;
    document.getElementById('intervaloGlobalInicio').value = intervaloGlobal.inicio || '';
    document.getElementById('intervaloGlobalRetorno').value = intervaloGlobal.retorno || '';
    toggleIntervaloGlobal();

    // Segunda a Sexta
    const segSex = horarios.segSex || {};
    document.getElementById('segSexAbre').value = segSex.abre || '';
    document.getElementById('segSexFecha').value = segSex.fecha || '';

    const diasAtivos = Array.isArray(segSex.dias) ? segSex.dias : ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
    document.querySelectorAll('.dia-semana').forEach(cb => {
      cb.checked = diasAtivos.includes(cb.value);
    });

    // Sábado
    const sabado = horarios.sabado || {};
    document.getElementById('sabadoAtivo').checked = sabado.ativo === true;
    document.getElementById('sabadoAbre').value = sabado.abre || '';
    document.getElementById('sabadoFecha').value = sabado.fecha || '';
    toggleDiaIndividual('sabado');

    // Domingo
    const domingo = horarios.domingo || {};
    document.getElementById('domingoAtivo').checked = domingo.ativo === true;
    document.getElementById('domingoAbre').value = domingo.abre || '';
    document.getElementById('domingoFecha').value = domingo.fecha || '';
    toggleDiaIndividual('domingo');
  }

  // Rola até o formulário
  document.getElementById('formAtualizacao').scrollIntoView({ behavior: 'smooth' });
}

// Salva as alterações da loja ou aprova proposta
async function atualizarLoja() {
  const id = document.getElementById('lojaId').value;
  const colecao = document.getElementById('colecaoOrigem').value;
  const isProposta = colecao === 'propostas';

  const tagsArray = document.getElementById('tags').value.trim()
    ? document.getElementById('tags').value.trim().split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const numeroWhats = document.getElementById('whatsapp').value.trim();
  const bairro = document.getElementById('bairro').value.trim();
  const endereco = document.getElementById('endereco').value.trim();

  if (!numeroWhats || !bairro) {
    return alert('WhatsApp e Bairro são obrigatórios.');
  }

  const naoInformaHorario = document.getElementById('naoInformaHorarioRadio').checked;

  let horarios = {
    informar: !naoInformaHorario,
    intervaloGlobal: { ativo: false, inicio: null, retorno: null },
    segSex: { ativo: false, dias: [], abre: null, fecha: null },
    sabado: { ativo: false, abre: null, fecha: null },
    domingo: { ativo: false, abre: null, fecha: null }
  };

  if (!naoInformaHorario) {
    const intervaloAtivo = document.getElementById('intervaloGlobalAtivo').checked;
    horarios.intervaloGlobal = {
      ativo: intervaloAtivo,
      inicio: intervaloAtivo ? document.getElementById('intervaloGlobalInicio').value.trim() || null : null,
      retorno: intervaloAtivo ? document.getElementById('intervaloGlobalRetorno').value.trim() || null : null
    };

    const diasSelecionados = Array.from(document.querySelectorAll('.dia-semana:checked')).map(cb => cb.value);

    horarios.segSex = {
      ativo: diasSelecionados.length > 0,
      dias: diasSelecionados,
      abre: diasSelecionados.length > 0 ? document.getElementById('segSexAbre').value.trim() || null : null,
      fecha: diasSelecionados.length > 0 ? document.getElementById('segSexFecha').value.trim() || null : null
    };

    const sabadoAtivo = document.getElementById('sabadoAtivo').checked;
    horarios.sabado = {
      ativo: sabadoAtivo,
      abre: sabadoAtivo ? document.getElementById('sabadoAbre').value.trim() || null : null,
      fecha: sabadoAtivo ? document.getElementById('sabadoFecha').value.trim() || null : null
    };

    const domingoAtivo = document.getElementById('domingoAtivo').checked;
    horarios.domingo = {
      ativo: domingoAtivo,
      abre: domingoAtivo ? document.getElementById('domingoAbre').value.trim() || null : null,
      fecha: domingoAtivo ? document.getElementById('domingoFecha').value.trim() || null : null
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
      // Atualiza loja existente
      await db.collection('users').doc(id).update({
        ...dadosGerais,
        filiais: [novaFilial]
      });
      alert('Loja atualizada com sucesso!');
    } else {
      // Aprova proposta: cria nova loja e remove da coleção propostas
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
      alert('Nova loja criada com sucesso a partir da proposta!');
      carregarPropostas(); // Atualiza lista de propostas
    }

    cancelarEdicao();
    carregarDesativados(); // Atualiza listas se necessário
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro: ' + error.message);
  }
}

// Cancela a edição e limpa o formulário
function cancelarEdicao() {
  document.getElementById('formAtualizacao').classList.add('hidden');
  document.getElementById('resultado').innerHTML = '';
  // Opcional: limpar campos do form
  document.getElementById('formLoja').reset();
}

// Estado padrão ao carregar a página (define "horários específicos" como selecionado)
document.addEventListener('DOMContentLoaded', () => {
  const defineRadio = document.getElementById('defineHorarioRadio');
  if (defineRadio) {
    defineRadio.checked = true;
  }
});

// Expõe as funções globalmente para uso nos atributos onclick do HTML
window.toggleModoHorario = toggleModoHorario;
window.toggleIntervaloGlobal = toggleIntervaloGlobal;
window.toggleDiaIndividual = toggleDiaIndividual;
window.carregarParaEdicao = carregarParaEdicao;
window.atualizarLoja = atualizarLoja;
window.cancelarEdicao = cancelarEdicao;