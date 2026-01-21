// js/main.js

// Variáveis globais para gerenciar a seleção da loja mãe
let lojaMaeSelecionada = null; // { id, nome }

// Inicia o modo filial (mostra o switch quando clica no botão)
function iniciarModoFilial() {
  document.getElementById('filialIniciar').classList.add('hidden');
  document.getElementById('filialAtiva').classList.remove('hidden');
  document.getElementById('lojaFilialSwitch').checked = false;
  toggleModoFilial(false);
}

// Toggle do switch "Esta loja é uma filial"
function toggleModoFilial(checked) {
  const conteudo = document.getElementById('filialConteudo');
  if (checked) {
    conteudo.classList.remove('hidden');
  } else {
    conteudo.classList.add('hidden');
    limparSelecaoMae();
  }
}

// Busca lojas principais (mãe) pelo nome
async function buscarLojaMae() {
  const termo = document.getElementById('buscaLojaMae').value.trim().toLowerCase();
  if (!termo) {
    alert('Digite o nome da loja principal');
    return;
  }

  const resultadoDiv = document.getElementById('resultadoLojaMae');
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
            <small>${data.filiais ? data.filiais.length + ' filial(is)' : 'Sem filiais'}</small>
          </div>
        `;
        item.onclick = () => selecionarLojaMae({ id: doc.id, nome: data.nome });
        resultadoDiv.appendChild(item);
      }
    });

    if (!encontrou) {
      resultadoDiv.innerHTML = '<p style="text-align:center;">Nenhuma loja encontrada.</p>';
    }
  } catch (error) {
    resultadoDiv.innerHTML = '<p style="color:red;">Erro na busca.</p>';
    console.error("Erro em buscarLojaMae:", error);
  }
}

// Seleciona a loja mãe
function selecionarLojaMae(item) {
  lojaMaeSelecionada = item;
  document.getElementById('nomeLojaMae').textContent = item.nome;
  document.getElementById('infoLojaMaeSelecionada').classList.remove('hidden');
  document.getElementById('resultadoLojaMae').innerHTML = '';
  document.getElementById('buscaLojaMae').value = '';
}

// Limpa a seleção da loja mãe
function limparSelecaoMae() {
  lojaMaeSelecionada = null;
  document.getElementById('infoLojaMaeSelecionada').classList.add('hidden');
  document.getElementById('resultadoLojaMae').innerHTML = '';
  document.getElementById('buscaLojaMae').value = '';
}

// Exclui uma filial específica da loja mãe (REATIVAÇÃO GARANTIDA)
async function excluirFilial(filialObj, filialId) {
  if (!confirm("Deseja remover esta filial da loja principal?")) {
    return;
  }

  const reativar = confirm("Após remover, deseja reativar a loja como independente no app?\n\nOK = Reativar (visível no app)\nCancelar = Manter inativa");

  try {
    const lojaAtualId = document.getElementById('lojaId').value;

    // Remove do array de filiais da mãe
    await db.collection('users').doc(lojaAtualId).update({
      filiais: firebase.firestore.FieldValue.arrayRemove(filialObj)
    });

    if (filialId) {
      const filhaDoc = await db.collection('users').doc(filialId).get();
      if (filhaDoc.exists) {
        const filhaData = filhaDoc.data();
        const filiaisOriginais = filhaData.filiaisBackup || [filialObj];

        const updates = {
          lojaFilial: firebase.firestore.FieldValue.delete(),
          maeId: firebase.firestore.FieldValue.delete(),
          filiaisBackup: firebase.firestore.FieldValue.delete(),
          filiais: filiaisOriginais
        };

        // SEMPRE reativa se o usuário escolher OK, ou se for apenas remover (mas aqui respeita a escolha)
        if (reativar) {
          updates['anuncio.postagem'] = true;
        }

        await db.collection('users').doc(filialId).update(updates);
      }
    }

    alert('Filial removida com sucesso!' + (reativar ? ' A loja foi reativada no app.' : ''));

    // Recarrega a edição da loja mãe
    const updatedDoc = await db.collection('users').doc(lojaAtualId).get();
    if (updatedDoc.exists) {
      carregarParaEdicao({ id: lojaAtualId, ...updatedDoc.data(), _colecao: 'users' });
    }
  } catch (error) {
    console.error("Erro ao excluir filial:", error);
    alert('Erro: ' + error.message);
  }
}

// Toggle principal: Não informa horário
function toggleHorariosGerais() {
  const naoInforma = document.getElementById('naoInformaHorario').checked;
  const container = document.getElementById('containerHorarios');

  if (naoInforma) {
    container.classList.add('disabled');
    document.querySelectorAll('#containerHorarios input[type=text]').forEach(i => i.value = '');
    document.querySelectorAll('#containerHorarios input[type=checkbox]:not(#naoInformaHorario)').forEach(i => i.checked = false);
    document.querySelectorAll('.sub-campos').forEach(el => el.classList.add('hidden'));
  } else {
    container.classList.remove('disabled');
  }
}

// Toggle intervalo global (almoço)
function toggleIntervaloGlobal() {
  const ativo = document.getElementById('intervaloGlobalAtivo').checked;
  document.getElementById('intervaloGlobalCampos').classList.toggle('hidden', !ativo);
}

// Toggle Segunda a Sexta
function toggleSegSex() {
  const ativo = document.getElementById('segSexAtivo').checked;
  document.getElementById('segSexCampos').classList.toggle('hidden', !ativo);
}

// Toggle Sábado ou Domingo
function toggleDiaIndividual(dia) {
  const ativo = document.getElementById(dia + 'Ativo').checked;
  document.getElementById(dia + 'Campos').classList.toggle('hidden', !ativo);
}

// Carrega dados no formulário de edição
async function carregarParaEdicao(item) {
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

  // Limpa seção de filial
  lojaMaeSelecionada = null;
  limparSelecaoMae();

  const ehFilial = item.lojaFilial === true;

  if (ehFilial && item.maeId) {
    document.getElementById('filialIniciar').classList.add('hidden');
    document.getElementById('filialAtiva').classList.remove('hidden');
    document.getElementById('lojaFilialSwitch').checked = true;
    toggleModoFilial(true);

    const maeDoc = await db.collection('users').doc(item.maeId).get();
    if (maeDoc.exists) {
      const maeData = maeDoc.data();
      document.getElementById('nomeLojaMae').textContent = maeData.nome || 'Loja principal';
      document.getElementById('infoLojaMaeSelecionada').classList.remove('hidden');
      lojaMaeSelecionada = { id: item.maeId, nome: maeData.nome };
    }
  } else {
    document.getElementById('filialIniciar').classList.remove('hidden');
    document.getElementById('filialAtiva').classList.add('hidden');
  }

  const filial = item.filiais?.[0] || {};
  const horarios = filial.horarios || {};

  document.getElementById('bairro').value = filial.bairro || '';
  document.getElementById('endereco').value = filial.endereco || '';
  document.getElementById('whatsapp').value = filial.whatsapp?.numero || '';
  document.getElementById('fazEntrega').checked = filial.fazEntrega === true;

  // Lista de filiais (se for loja mãe)
  const existente = document.getElementById('filiaisLista');
  if (existente && existente.parentNode) existente.parentNode.removeChild(existente);

  const filiaisLista = document.createElement('div');
  filiaisLista.id = 'filiaisLista';
  filiaisLista.className = 'item-list';
  filiaisLista.style.marginTop = '24px';

  if (item.filiais && item.filiais.length > 0 && !ehFilial) {
    filiaisLista.innerHTML = '<h3 style="font-size:1.1rem; margin-bottom:16px; font-weight:600;">Filiais desta loja</h3>';
    item.filiais.forEach(filialItem => {
      const filialId = filialItem.filialId || null;
      const bairro = filialItem.bairro || 'Sem bairro';
      const whatsapp = filialItem.whatsapp?.numero || 'Sem WhatsApp';

      const itemEl = document.createElement('div');
      itemEl.className = 'item';
      itemEl.innerHTML = `
        <div class="item-info">
          <h4>${bairro}</h4>
          <small>Whats: ${whatsapp}</small>
        </div>
        <button class="btn btn-secondary btn-small" onclick='excluirFilial(${JSON.stringify(filialItem).replace(/'/g, "\\'")}, "${filialId || ''}")'>
          Excluir filial
        </button>
      `;
      filiaisLista.appendChild(itemEl);
    });

    document.querySelector('#formLoja .form-actions').before(filiaisLista);
  }

  // Horários
  const naoInforma = !horarios.informar || horarios.informar === undefined;
  document.getElementById('naoInformaHorario').checked = naoInforma;
  toggleHorariosGerais();

  if (!naoInforma) {
    const intervaloGlobal = horarios.intervaloGlobal || {};
    document.getElementById('intervaloGlobalAtivo').checked = intervaloGlobal.ativo === true;
    document.getElementById('intervaloGlobalInicio').value = intervaloGlobal.inicio || '';
    document.getElementById('intervaloGlobalRetorno').value = intervaloGlobal.retorno || '';
    toggleIntervaloGlobal();

    const segSex = horarios.segSex || {};
    document.getElementById('segSexAtivo').checked = segSex.ativo === true;
    document.getElementById('segSexAbre').value = segSex.abre || '';
    document.getElementById('segSexFecha').value = segSex.fecha || '';
    toggleSegSex();

    const diasAtivos = Array.isArray(segSex.dias) ? segSex.dias : ['segunda','terca','quarta','quinta','sexta'];
    document.querySelectorAll('.dia-semana').forEach(cb => {
      cb.checked = diasAtivos.includes(cb.value);
    });

    const sabado = horarios.sabado || {};
    document.getElementById('sabadoAtivo').checked = sabado.ativo === true;
    document.getElementById('sabadoAbre').value = sabado.abre || '';
    document.getElementById('sabadoFecha').value = sabado.fecha || '';
    toggleDiaIndividual('sabado');

    const domingo = horarios.domingo || {};
    document.getElementById('domingoAtivo').checked = domingo.ativo === true;
    document.getElementById('domingoAbre').value = domingo.abre || '';
    document.getElementById('domingoFecha').value = domingo.fecha || '';
    toggleDiaIndividual('domingo');
  }

  document.getElementById('formAtualizacao').scrollIntoView({ behavior: 'smooth' });
}

// Salva as alterações (REATIVAÇÃO DE VISIBILIDADE GARANTIDA)
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

  const naoInformaHorario = document.getElementById('naoInformaHorario').checked;

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
    bairro: bairro,
    endereco: endereco || null,
    whatsapp: { numero: numeroWhats, principal: true },
    fazEntrega: document.getElementById('fazEntrega').checked,
    horarios: horarios,
    filialId: id
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

  const switchElement = document.getElementById('lojaFilialSwitch');
  const ehFilialAgora = switchElement ? switchElement.checked : false;

  try {
    if (ehFilialAgora) {
      if (!lojaMaeSelecionada || !lojaMaeSelecionada.id) {
        return alert('Selecione uma loja principal (mãe) válida.');
      }

      const maeDoc = await db.collection('users').doc(lojaMaeSelecionada.id).get();
      if (!maeDoc.exists) {
        limparSelecaoMae();
        return alert('A loja principal selecionada não existe mais. Por favor, selecione outra.');
      }

      const batch = db.batch();

      batch.update(db.collection('users').doc(lojaMaeSelecionada.id), {
        filiais: firebase.firestore.FieldValue.arrayUnion(novaFilial)
      });

      const lojaRef = db.collection('users').doc(id);
      batch.update(lojaRef, {
        lojaFilial: true,
        maeId: lojaMaeSelecionada.id,
        anuncio: { ...dadosGerais.anuncio, postagem: false },
        filiaisBackup: [novaFilial]
      });

      if (isProposta) {
        batch.delete(db.collection('propostas').doc(id));
      }

      await batch.commit();
      alert('Loja transformada em filial com sucesso!');
    } else {
      const lojaRef = db.collection('users').doc(id);

      if (isProposta) {
        await lojaRef.set({
          ...dadosGerais,
          filiais: [novaFilial],
          temFiliais: false,
          clicks: 0,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          anuncio: { ...dadosGerais.anuncio, postagem: true }
        });

        await db.collection('propostas').doc(id).delete();
        alert('Nova loja criada com sucesso a partir da proposta!');
        carregarPropostas();
      } else {
        const doc = await lojaRef.get();
        if (!doc.exists) {
          alert('Esta loja não existe mais no banco de dados.');
          cancelarEdicao();
          return;
        }

        // Se estava como filial, remove da mãe
        if (doc.data().lojaFilial && doc.data().maeId) {
          const maeDoc = await db.collection('users').doc(doc.data().maeId).get();
          if (maeDoc.exists) {
            const filialObjAntigo = doc.data().filiaisBackup?.[0] || novaFilial;
            filialObjAntigo.filialId = id;

            await db.collection('users').doc(doc.data().maeId).update({
              filiais: firebase.firestore.FieldValue.arrayRemove(filialObjAntigo)
            });
          }
        }

        // SEMPRE reativa visibilidade quando deixa de ser filial ou ao salvar loja normal
        await lojaRef.update({
          ...dadosGerais,
          filiais: doc.data().filiaisBackup || [novaFilial],
          lojaFilial: firebase.firestore.FieldValue.delete(),
          maeId: firebase.firestore.FieldValue.delete(),
          filiaisBackup: firebase.firestore.FieldValue.delete(),
          anuncio: { ...dadosGerais.anuncio, postagem: true } // GARANTIDO AQUI
        });

        alert('Loja atualizada com sucesso e reativada no app!');
      }
    }

    cancelarEdicao();
    carregarDesativados();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar: ' + error.message);
  }
}

// Cancela edição
function cancelarEdicao() {
  document.getElementById('formAtualizacao').classList.add('hidden');
  document.getElementById('resultado').innerHTML = '';
  document.getElementById('formLoja').reset();
  lojaMaeSelecionada = null;
}

// Expõe funções globalmente
window.iniciarModoFilial = iniciarModoFilial;
window.toggleModoFilial = toggleModoFilial;
window.buscarLojaMae = buscarLojaMae;
window.selecionarLojaMae = selecionarLojaMae;
window.limparSelecaoMae = limparSelecaoMae;
window.excluirFilial = excluirFilial;
window.toggleHorariosGerais = toggleHorariosGerais;
window.toggleIntervaloGlobal = toggleIntervaloGlobal;
window.toggleSegSex = toggleSegSex;
window.toggleDiaIndividual = toggleDiaIndividual;
window.carregarParaEdicao = carregarParaEdicao;
window.atualizarLoja = atualizarLoja;
window.cancelarEdicao = cancelarEdicao;