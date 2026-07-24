/* ==========================================================
   SIGACTPAR - MÓDULO DE CRIANÇAS E ADOLESCENTES
   VERSÃO COMPLETA COM INTEGRAÇÃO PDF
========================================================== */

// ==========================================
// BANCO DE DADOS LOCAL
// ==========================================
let criancas = [];

function carregarCriancas() {
    try {
        const dados = localStorage.getItem('criancas');
        if (dados) {
            criancas = JSON.parse(dados);
        } else {
            // Dados de exemplo
            criancas = [
                {
                    id: 1,
                    nome: 'João Silva',
                    nascimento: '2015-03-15',
                    cpf: '123.456.789-00',
                    escola: 'Escola Municipal',
                    responsavel: 'Maria Silva',
                    observacoes: 'Suspeita de abuso'
                }
            ];
            salvarCriancas();
        }
    } catch (e) {
        console.error('Erro ao carregar:', e);
        criancas = [];
    }
    return criancas;
}

function salvarCriancas() {
    try {
        localStorage.setItem('criancas', JSON.stringify(criancas));
    } catch (e) {
        console.error('Erro ao salvar:', e);
    }
}

// ==========================================
// FUNÇÕES AUXILIARES DE DATA
// ==========================================
function formatarData(dataStr) {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
}

function formatarDataParaInput(dataStr) {
    if (!dataStr) return '';
    const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return dataStr;
}

// ==========================================
// RENDERIZAR TABELA (CORRIGIDO)
// ==========================================
function renderizarCriancas(filtro = '') {
    const tbody = document.getElementById('listaCriancas');
    if (!tbody) return;

    let lista = criancas;
    
    if (filtro) {
        const termo = filtro.toLowerCase();
        lista = criancas.filter(c => 
            c.nome.toLowerCase().includes(termo) ||
            (c.escola && c.escola.toLowerCase().includes(termo)) ||
            (c.responsavel && c.responsavel.toLowerCase().includes(termo)) ||
            (c.cpf && c.cpf.includes(termo))
        );
    }

    if (lista.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--texto-secundario);">
                <i class="fa-regular fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                Nenhuma criança ou adolescente cadastrado.
            </td>
        </tr>`;
        return;
    }

    let html = '';
    for (const c of lista) {
        html += `
            <tr>
                <td><strong>#${c.id}</strong></td>
                <td>${c.nome}</td>
                <td>${formatarData(c.nascimento)}</td>
                <td>${c.escola || '—'}</td>
                <td>${c.responsavel || '—'}</td>
                <td>
                    <div class="tabela-acoes">
                        <button class="btn-acao-tabela btn-visualizar" onclick="visualizarCrianca(${c.id})" title="Visualizar">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-acao-tabela btn-editar" onclick="editarCrianca(${c.id})" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-acao-tabela btn-excluir" onclick="abrirExcluirCrianca(${c.id})" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;

    atualizarCardsCriancas();
}

// ==========================================
// ATUALIZAR CARDS
// ==========================================
function atualizarCardsCriancas() {
    const total = criancas.length;
    const comEscola = criancas.filter(c => c.escola && c.escola.trim() !== '').length;

    const cardTotal = document.getElementById('cardTotalCriancas');
    const cardEscola = document.getElementById('cardComEscola');

    if (cardTotal) cardTotal.textContent = total;
    if (cardEscola) cardEscola.textContent = comEscola;
}

// ==========================================
// ABRIR MODAL NOVO/EDIÇÃO
// ==========================================
function abrirModalCrianca(crianca = null) {
    const modal = document.getElementById('modalCrianca');
    const form = document.getElementById('formCrianca');
    if (!modal || !form) return;

    form.reset();
    delete form.dataset.id;

    if (crianca) {
        document.querySelector('#modalCrianca .modal-header h2').innerHTML = 
            '<i class="fa-solid fa-pen-to-square"></i> Editar Criança / Adolescente';
        
        document.getElementById('nomeCrianca').value = crianca.nome || '';
        document.getElementById('nascimentoCrianca').value = crianca.nascimento || '';
        document.getElementById('cpfCrianca').value = crianca.cpf || '';
        document.getElementById('escolaCrianca').value = crianca.escola || '';
        document.getElementById('responsavelCrianca').value = crianca.responsavel || '';
        document.getElementById('observacoesCrianca').value = crianca.observacoes || '';
        
        form.dataset.id = crianca.id;
    } else {
        document.querySelector('#modalCrianca .modal-header h2').innerHTML = 
            '<i class="fa-solid fa-child"></i> Formulário de Criança / Adolescente';
    }

    modal.style.display = 'flex';
}

function fecharModalCrianca() {
    const modal = document.getElementById('modalCrianca');
    if (modal) modal.style.display = 'none';
}

// ==========================================
// SALVAR CRIANÇA
// ==========================================
document.addEventListener('submit', (e) => {
    if (e.target.id === 'formCrianca') {
        e.preventDefault();
        
        const form = e.target;
        const nome = document.getElementById('nomeCrianca').value.trim();
        const nascimento = document.getElementById('nascimentoCrianca').value;
        const cpf = document.getElementById('cpfCrianca').value.trim();
        const escola = document.getElementById('escolaCrianca').value.trim();
        const responsavel = document.getElementById('responsavelCrianca').value.trim();
        const observacoes = document.getElementById('observacoesCrianca').value.trim();

        if (!nome || !nascimento || !responsavel) {
            alert('⚠️ Preencha todos os campos obrigatórios!');
            return;
        }

        const id = form.dataset.id ? parseInt(form.dataset.id) : null;

        if (id) {
            const index = criancas.findIndex(c => c.id === id);
            if (index !== -1) {
                criancas[index] = { id, nome, nascimento, cpf, escola, responsavel, observacoes };
            }
        } else {
            const novoId = criancas.length > 0 ? Math.max(...criancas.map(c => c.id)) + 1 : 1;
            criancas.push({ id: novoId, nome, nascimento, cpf, escola, responsavel, observacoes });
        }

        salvarCriancas();
        renderizarCriancas();
        fecharModalCrianca();
        
        alert(id ? '✅ Criança atualizada com sucesso!' : '✅ Criança cadastrada com sucesso!');
    }
});

// ==========================================
// VISUALIZAR CRIANÇA
// ==========================================
function visualizarCrianca(id) {
    const crianca = criancas.find(c => c.id === id);
    if (!crianca) return;

    document.getElementById('verIdCrianca').value = `#${crianca.id}`;
    document.getElementById('verNomeCrianca').value = crianca.nome || '—';
    document.getElementById('verNascimentoCrianca').value = formatarData(crianca.nascimento);
    document.getElementById('verCpfCrianca').value = crianca.cpf || 'Não informado';
    document.getElementById('verEscolaCrianca').value = crianca.escola || '—';
    document.getElementById('verResponsavelCrianca').value = crianca.responsavel || '—';
    document.getElementById('verObservacoesCrianca').value = crianca.observacoes || 'Nenhuma observação registrada.';

    document.getElementById('modalVisualizarCrianca').style.display = 'flex';
}

function fecharModalVisualizacaoCrianca() {
    document.getElementById('modalVisualizarCrianca').style.display = 'none';
}

// ==========================================
// EDITAR CRIANÇA
// ==========================================
function editarCrianca(id) {
    const crianca = criancas.find(c => c.id === id);
    if (crianca) {
        abrirModalCrianca(crianca);
    }
}

// ==========================================
// EXCLUIR CRIANÇA
// ==========================================
let idExcluirCrianca = null;

function abrirExcluirCrianca(id) {
    idExcluirCrianca = id;
    document.getElementById('modalExcluirCrianca').style.display = 'flex';
}

function fecharModalExcluirCrianca() {
    idExcluirCrianca = null;
    document.getElementById('modalExcluirCrianca').style.display = 'none';
}

document.getElementById('confirmarExcluirCrianca')?.addEventListener('click', () => {
    if (idExcluirCrianca !== null) {
        criancas = criancas.filter(c => c.id !== idExcluirCrianca);
        salvarCriancas();
        renderizarCriancas();
        fecharModalExcluirCrianca();
        alert('🗑️ Criança excluída com sucesso!');
        idExcluirCrianca = null;
    }
});

// ==========================================
// FECHAR MODAIS (GERAL)
// ==========================================
function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// ==========================================
// 🆕 FUNÇÃO PARA PREENCHER DO PDF
// ==========================================
function preencherCriancaDoPDF(dados) {
    console.log('📝 Preenchendo formulário de criança com dados do PDF...');
    
    if (!dados) {
        console.warn('⚠️ Nenhum dado para preencher!');
        return;
    }

    const modal = document.getElementById('modalCrianca');
    const form = document.getElementById('formCrianca');
    
    if (!modal || !form) {
        console.warn('⚠️ Modal de criança não encontrado!');
        return;
    }

    // Abre o modal
    modal.style.display = 'flex';
    
    // Limpa o form e remove ID de edição
    form.reset();
    delete form.dataset.id;

    // 1. NOME
    const nomeInput = document.getElementById('nomeCrianca');
    if (nomeInput && dados.nome) {
        nomeInput.value = dados.nome;
        console.log(`✅ Nome preenchido: ${dados.nome}`);
    }

    // 2. DATA DE NASCIMENTO
    const nascimentoInput = document.getElementById('nascimentoCrianca');
    if (nascimentoInput && dados.nascimento) {
        const dataFormatada = formatarDataParaInput(dados.nascimento);
        if (dataFormatada) {
            nascimentoInput.value = dataFormatada;
            console.log(`✅ Nascimento preenchido: ${dataFormatada}`);
        }
    }

    // 3. ESCOLA
    const escolaInput = document.getElementById('escolaCrianca');
    if (escolaInput && dados.escola) {
        escolaInput.value = dados.escola;
        console.log(`✅ Escola preenchida: ${dados.escola}`);
    }

    // 4. RESPONSÁVEL
    const responsavelInput = document.getElementById('responsavelCrianca');
    if (responsavelInput && dados.responsavel) {
        responsavelInput.value = dados.responsavel;
        console.log(`✅ Responsável preenchido: ${dados.responsavel}`);
    }

    // 5. OBSERVAÇÕES
    const observacoesInput = document.getElementById('observacoesCrianca');
    if (observacoesInput) {
        let observacoes = [];
        
        if (dados.observacao) observacoes.push(dados.observacao);
        if (dados.assunto) observacoes.push(`📋 Assunto: ${dados.assunto}`);
        if (dados.endereco) observacoes.push(`📍 Endereço: ${dados.endereco}`);
        if (dados.telefone) observacoes.push(`📞 Telefone: ${dados.telefone}`);
        if (dados.contato) observacoes.push(`📱 Contato: ${dados.contato}`);
        if (dados.dataAtendimento) observacoes.push(`📅 Data Atendimento: ${dados.dataAtendimento}`);
        if (dados.tipoAtendimento) observacoes.push(`📋 Tipo: ${dados.tipoAtendimento}`);
        if (dados.plantonista) observacoes.push(`👨‍💼 Plantonista: ${dados.plantonista}`);
        if (dados.processo) observacoes.push(`⚖️ Processo: ${dados.processo}`);
        if (dados.vara) observacoes.push(`🏛️ Vara: ${dados.vara}`);
        if (dados.juiz) observacoes.push(`👨‍⚖️ Juiz: ${dados.juiz}`);
        if (dados.promotor) observacoes.push(`⚖️ Promotor: ${dados.promotor}`);
        if (dados.serie) observacoes.push(`📚 Série: ${dados.serie}`);
        
        observacoesInput.value = observacoes.join('\n');
        console.log(`✅ Observações preenchidas (${observacoes.length} itens)`);
    }

    // 6. CPF
    const cpfInput = document.getElementById('cpfCrianca');
    if (cpfInput && dados.cpf) {
        cpfInput.value = dados.cpf;
        console.log(`✅ CPF preenchido: ${dados.cpf}`);
    }

    // 7. ATUALIZA TÍTULO
    const tituloModal = document.querySelector('#modalCrianca .modal-header h2');
    if (tituloModal) {
        tituloModal.innerHTML = '<i class="fa-solid fa-child"></i> Criança / Adolescente (Dados do PDF)';
    }

    console.log('✅ Formulário de criança preenchido com sucesso!');
}

// ==========================================
// EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('👶 Inicializando módulo de Crianças...');
    
    // Botão nova criança
    const btnNovo = document.getElementById('btnNovaCrianca');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => abrirModalCrianca(null));
    }

    // Botão atualizar
    const btnAtualizar = document.getElementById('btnAtualizarCriancas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            carregarCriancas();
            renderizarCriancas();
            alert('🔄 Dados atualizados!');
        });
    }

    // Botões fechar modal
    document.querySelectorAll('.fechar, #cancelarCrianca, #fecharVisualizarCrianca, #fecharVisualizarCriancaRodape, #cancelarExcluirCrianca, #fecharExcluirCrianca')
        .forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    if (modal) modal.style.display = 'none';
                });
            }
        });

    // Fechar ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Pesquisa
    const pesquisa = document.getElementById('pesquisaCrianca');
    if (pesquisa) {
        pesquisa.addEventListener('input', (e) => {
            renderizarCriancas(e.target.value);
        });
    }

    // Carregar dados iniciais
    carregarCriancas();
    renderizarCriancas();
    
    console.log(`👶 ${criancas.length} crianças carregadas!`);
});

// ==========================================
// EXPORTA FUNÇÕES
// ==========================================
window.visualizarCrianca = visualizarCrianca;
window.editarCrianca = editarCrianca;
window.abrirExcluirCrianca = abrirExcluirCrianca;
window.fecharModal = fecharModal;
window.abrirModalCrianca = abrirModalCrianca;
window.preencherCriancaDoPDF = preencherCriancaDoPDF;
window.carregarCriancas = carregarCriancas;
window.renderizarCriancas = renderizarCriancas;

console.log('👶 Módulo de Crianças carregado com sucesso!');
