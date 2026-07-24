/* ==========================================================
   SIGACTPAR - MÓDULO DE RESPONSÁVEIS
   VERSÃO COMPLETA COM INTEGRAÇÃO PDF
========================================================== */

let responsavelEditando = null;
let idExcluirResponsavel = null;

// ==========================================
// INICIALIZAÇÃO
// ==========================================
function iniciarResponsaveis() {
    configurarEventosResponsaveis();
    atualizarTabelaResponsaveis();
    atualizarIndicadoresResponsaveis();
    console.log('👤 Módulo de Responsáveis iniciado!');
}

// ==========================================
// CONFIGURAR EVENTOS
// ==========================================
function configurarEventosResponsaveis() {
    const btnNovo = document.getElementById("btnNovoResponsavel");
    if (btnNovo) {
        btnNovo.onclick = () => {
            responsavelEditando = null;
            const form = document.getElementById("formResponsavel");
            if (form) form.reset();
            abrirModalResponsavel();
        };
    }

    const btnAtualizar = document.getElementById("btnAtualizarResponsaveis");
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            atualizarTabelaResponsaveis();
            atualizarIndicadoresResponsaveis();
        };
    }

    const fechar = document.getElementById("fecharModalResponsavel");
    const cancelar = document.getElementById("cancelarResponsavel");
    if (fechar) fechar.onclick = fecharModalResponsavel;
    if (cancelar) cancelar.onclick = fecharModalResponsavel;

    // Fechar modal de visualização
    const fecharVis = document.getElementById("fecharVisualizarResponsavel");
    const fecharVisRodape = document.getElementById("fecharVisualizarResponsavelRodape");
    if (fecharVis) fecharVis.onclick = fecharModalVisualizacaoResponsavel;
    if (fecharVisRodape) fecharVisRodape.onclick = fecharModalVisualizacaoResponsavel;

    // Fechar modal de exclusão
    const fecharExc = document.getElementById("fecharExcluirResponsavel");
    const cancelarExc = document.getElementById("cancelarExcluirResponsavel");
    const confirmarExc = document.getElementById("confirmarExcluirResponsavel");
    if (fecharExc) fecharExc.onclick = fecharModalExcluirResponsavel;
    if (cancelarExc) cancelarExc.onclick = fecharModalExcluirResponsavel;
    if (confirmarExc) confirmarExc.onclick = confirmarExclusaoResponsavel;

    const pesquisa = document.getElementById("pesquisaResponsavel");
    if (pesquisa) pesquisa.onkeyup = atualizarTabelaResponsaveis;

    const form = document.getElementById("formResponsavel");
    if (form) form.onsubmit = salvarResponsavel;
}

// ==========================================
// FUNÇÕES DE MODAL
// ==========================================
function abrirModalResponsavel() {
    const modal = document.getElementById("modalResponsavel");
    if (modal) modal.classList.add("ativo");
}

function fecharModalResponsavel() {
    const modal = document.getElementById("modalResponsavel");
    if (modal) modal.classList.remove("ativo");
    responsavelEditando = null;
}

function abrirModalVisualizacaoResponsavel() {
    const modal = document.getElementById("modalVisualizarResponsavel");
    if (modal) modal.classList.add("ativo");
}

function fecharModalVisualizacaoResponsavel() {
    const modal = document.getElementById("modalVisualizarResponsavel");
    if (modal) modal.classList.remove("ativo");
}

function fecharModalExcluirResponsavel() {
    idExcluirResponsavel = null;
    const modal = document.getElementById("modalExcluirResponsavel");
    if (modal) modal.classList.remove("ativo");
}

// ==========================================
// INDICADORES
// ==========================================
function atualizarIndicadoresResponsaveis() {
    if (!Banco || !Banco.dados || !Banco.dados.responsaveis) return;
    const total = Banco.dados.responsaveis.length;
    const cardTotal = document.getElementById("cardTotalResponsaveis");
    if (cardTotal) cardTotal.textContent = total;
}

// ==========================================
// SALVAR RESPONSÁVEL
// ==========================================
function salvarResponsavel(e) {
    e.preventDefault();

    const objeto = {
        id: responsavelEditando ?? gerarId("responsavel"),
        nome: document.getElementById("nomeResponsavel").value.trim(),
        cpf: document.getElementById("cpfResponsavel").value.trim(),
        telefone: document.getElementById("telefoneResponsavel").value.trim(),
        endereco: document.getElementById("enderecoResponsavel").value.trim(),
        observacoes: document.getElementById("observacoesResponsavel").value.trim()
    };

    if (!objeto.nome || !objeto.cpf || !objeto.telefone || !objeto.endereco) {
        alert("⚠️ Preencha todos os campos obrigatórios!");
        return;
    }

    if (responsavelEditando === null) {
        inserirRegistro("responsaveis", objeto);
    } else {
        atualizarRegistro("responsaveis", objeto);
    }

    atualizarTabelaResponsaveis();
    atualizarIndicadoresResponsaveis();
    fecharModalResponsavel();
}

// ==========================================
// TABELA
// ==========================================
function atualizarTabelaResponsaveis() {
    const tbody = document.getElementById("listaResponsaveis");
    if (!tbody || !Banco || !Banco.dados || !Banco.dados.responsaveis) return;

    tbody.innerHTML = "";
    const termo = document.getElementById("pesquisaResponsavel")?.value.toLowerCase() || "";

    let lista = Banco.dados.responsaveis.filter(item => 
        (item.nome && item.nome.toLowerCase().includes(termo)) ||
        (item.cpf && item.cpf.toLowerCase().includes(termo)) ||
        (item.telefone && item.telefone.toLowerCase().includes(termo)) ||
        (item.endereco && item.endereco.toLowerCase().includes(termo))
    );

    lista.sort((a, b) => b.id - a.id);

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--texto-secundario);">
            <i class="fa-regular fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
            Nenhum responsável cadastrado.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>${item.nome}</td>
            <td>${item.cpf || '—'}</td>
            <td>${item.telefone || '—'}</td>
            <td>${item.endereco || '—'}</td>
            <td>
                <div class="tabela-acoes">
                    <button class="btn-acao-tabela btn-visualizar" onclick="visualizarResponsavel(${item.id})" title="Visualizar">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-acao-tabela btn-editar" onclick="editarResponsavel(${item.id})" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-acao-tabela btn-excluir" onclick="excluirResponsavelModal(${item.id})" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// ==========================================
// BUSCAR RESPONSÁVEL
// ==========================================
function buscarResponsavel(id) {
    if (!Banco || !Banco.dados || !Banco.dados.responsaveis) return null;
    return Banco.dados.responsaveis.find(item => item.id === id);
}

// ==========================================
// VISUALIZAR RESPONSÁVEL
// ==========================================
function visualizarResponsavel(id) {
    const item = buscarResponsavel(id);
    if (!item) return;

    document.getElementById("verIdResponsavel").value = `#${item.id}`;
    document.getElementById("verNomeResponsavel").value = item.nome || '—';
    document.getElementById("verCpfResponsavel").value = item.cpf || '—';
    document.getElementById("verTelefoneResponsavel").value = item.telefone || '—';
    document.getElementById("verEnderecoResponsavel").value = item.endereco || '—';
    document.getElementById("verObservacoesResponsavel").value = item.observacoes || 'Nenhuma observação registrada.';

    abrirModalVisualizacaoResponsavel();
}

// ==========================================
// EDITAR RESPONSÁVEL
// ==========================================
function editarResponsavel(id) {
    const item = buscarResponsavel(id);
    if (!item) return;

    responsavelEditando = item.id;
    document.getElementById("nomeResponsavel").value = item.nome || '';
    document.getElementById("cpfResponsavel").value = item.cpf || '';
    document.getElementById("telefoneResponsavel").value = item.telefone || '';
    document.getElementById("enderecoResponsavel").value = item.endereco || '';
    document.getElementById("observacoesResponsavel").value = item.observacoes || '';

    abrirModalResponsavel();
}

// ==========================================
// EXCLUIR RESPONSÁVEL
// ==========================================
function excluirResponsavelModal(id) {
    idExcluirResponsavel = id;
    const modal = document.getElementById("modalExcluirResponsavel");
    if (modal) modal.classList.add("ativo");
}

function confirmarExclusaoResponsavel() {
    if (idExcluirResponsavel === null) return;

    removerRegistro("responsaveis", idExcluirResponsavel);
    atualizarTabelaResponsaveis();
    atualizarIndicadoresResponsaveis();
    fecharModalExcluirResponsavel();
}

// ==========================================
// FECHAR MODAIS (GERAL)
// ==========================================
function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// ==========================================================
// 🆕 FUNÇÃO PARA PREENCHER DO PDF
// ==========================================================
function preencherResponsavelDoPDF(dados) {
    console.log('📝 Preenchendo formulário de responsável com dados do PDF...');
    
    if (!dados) {
        console.warn('⚠️ Nenhum dado para preencher!');
        return;
    }

    const modal = document.getElementById('modalResponsavel');
    const form = document.getElementById('formResponsavel');
    
    if (!modal || !form) {
        console.warn('⚠️ Modal de responsável não encontrado!');
        return;
    }

    // Abre o modal
    modal.classList.add('ativo');
    
    // Reseta o formulário
    form.reset();
    responsavelEditando = null;

    // ==========================================
    // 1. NOME DO RESPONSÁVEL
    // ==========================================
    const nomeInput = document.getElementById('nomeResponsavel');
    if (nomeInput) {
        // Prioriza o campo responsável, depois nome da criança
        if (dados.responsavel) {
            nomeInput.value = dados.responsavel;
            console.log(`✅ Nome preenchido: ${dados.responsavel}`);
        } else if (dados.nome) {
            nomeInput.value = dados.nome;
            console.log(`✅ Nome preenchido (fallback): ${dados.nome}`);
        }
    }

    // ==========================================
    // 2. CPF (se disponível)
    // ==========================================
    const cpfInput = document.getElementById('cpfResponsavel');
    if (cpfInput && dados.cpf) {
        cpfInput.value = dados.cpf;
        console.log(`✅ CPF preenchido: ${dados.cpf}`);
    }

    // ==========================================
    // 3. TELEFONE
    // ==========================================
    const telefoneInput = document.getElementById('telefoneResponsavel');
    if (telefoneInput) {
        if (dados.telefone) {
            telefoneInput.value = dados.telefone;
            console.log(`✅ Telefone preenchido: ${dados.telefone}`);
        } else if (dados.contato) {
            telefoneInput.value = dados.contato;
            console.log(`✅ Telefone preenchido (fallback): ${dados.contato}`);
        }
    }

    // ==========================================
    // 4. ENDEREÇO
    // ==========================================
    const enderecoInput = document.getElementById('enderecoResponsavel');
    if (enderecoInput && dados.endereco) {
        enderecoInput.value = dados.endereco;
        console.log(`✅ Endereço preenchido: ${dados.endereco}`);
    }

    // ==========================================
    // 5. OBSERVAÇÕES (COMPLETAS)
    // ==========================================
    const observacoesInput = document.getElementById('observacoesResponsavel');
    if (observacoesInput) {
        let observacoes = [];
        
        // Informações da criança
        if (dados.nome) observacoes.push(`👶 Criança: ${dados.nome}`);
        if (dados.nascimento) observacoes.push(`📅 Nascimento: ${dados.nascimento}`);
        if (dados.escola) observacoes.push(`🏫 Escola: ${dados.escola}`);
        if (dados.serie) observacoes.push(`📚 Série: ${dados.serie}`);
        
        // Informações do atendimento
        if (dados.assunto) observacoes.push(`📋 Assunto: ${dados.assunto}`);
        if (dados.dataAtendimento) observacoes.push(`📅 Data Atendimento: ${dados.dataAtendimento}`);
        if (dados.tipoAtendimento) observacoes.push(`📋 Tipo Atendimento: ${dados.tipoAtendimento}`);
        if (dados.plantonista) observacoes.push(`👨‍💼 Plantonista: ${dados.plantonista}`);
        
        // Informações do processo
        if (dados.processo) observacoes.push(`⚖️ Nº Processo: ${dados.processo}`);
        if (dados.vara) observacoes.push(`🏛️ Vara: ${dados.vara}`);
        if (dados.juiz) observacoes.push(`👨‍⚖️ Juiz: ${dados.juiz}`);
        if (dados.promotor) observacoes.push(`⚖️ Promotor: ${dados.promotor}`);
        
        // Endereço e contato
        if (dados.endereco) observacoes.push(`📍 Endereço: ${dados.endereco}`);
        if (dados.telefone) observacoes.push(`📞 Telefone: ${dados.telefone}`);
        if (dados.contato) observacoes.push(`📱 Contato: ${dados.contato}`);
        
        // Observação geral
        if (dados.observacao) observacoes.push(`📝 Obs: ${dados.observacao}`);
        
        observacoesInput.value = observacoes.join('\n');
        console.log(`✅ Observações preenchidas (${observacoes.length} itens)`);
    }

    // ==========================================
    // 6. ATUALIZA TÍTULO DO MODAL
    // ==========================================
    const tituloModal = document.querySelector('#modalResponsavel .modal-header h2');
    if (tituloModal) {
        tituloModal.innerHTML = '<i class="fa-solid fa-user-plus"></i> Responsável Legal (Dados do PDF)';
    }

    console.log('✅ Formulário de responsável preenchido com sucesso!');
    console.table(dados);
}

// ==========================================
// FUNÇÃO PARA VERIFICAR DADOS DO PDF
// ==========================================
function verificarDadosPDFResponsavel() {
    try {
        const dadosSalvos = localStorage.getItem('dadosPdfExtraidos');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            if (dados && (dados.responsavel || dados.nome)) {
                console.log('📄 Dados do PDF encontrados para responsável:', dados);
                return dados;
            }
        }
    } catch (e) {
        console.error('Erro ao verificar dados do PDF:', e);
    }
    return null;
}

// ==========================================
// FUNÇÃO PARA CARREGAR DADOS DO PDF AUTOMATICAMENTE
// ==========================================
function carregarDadosPDFNoFormularioResponsavel() {
    const dados = verificarDadosPDFResponsavel();
    if (dados) {
        console.log('📄 Carregando dados do PDF automaticamente para responsável...');
        preencherResponsavelDoPDF(dados);
    }
}

// ==========================================
// EXPORTA FUNÇÕES PARA O GLOBAL
// ==========================================
window.preencherResponsavelDoPDF = preencherResponsavelDoPDF;
window.verificarDadosPDFResponsavel = verificarDadosPDFResponsavel;
window.carregarDadosPDFNoFormularioResponsavel = carregarDadosPDFNoFormularioResponsavel;
window.visualizarResponsavel = visualizarResponsavel;
window.editarResponsavel = editarResponsavel;
window.excluirResponsavelModal = excluirResponsavelModal;
window.fecharModal = fecharModal;

console.log('👤 Módulo de Responsáveis com integração PDF carregado!');
