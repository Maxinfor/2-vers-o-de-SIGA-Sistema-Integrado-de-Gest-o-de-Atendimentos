/* ==========================================================
   SIGACTPAR - MÓDULO DE CRIANÇAS E ADOLESCENTES
   VERSÃO COM INTEGRAÇÃO DE PDF
========================================================== */

let criancaEditando = null;
let criancaExcluir = null;

// ==========================================
// INICIALIZAÇÃO
// ==========================================
function iniciarCriancas() {
    configurarEventosCriancas();
    atualizarTabelaCriancas();
    atualizarIndicadoresCriancas();
    console.log('👶 Módulo de Crianças iniciado!');
}

// ==========================================
// CONFIGURAR EVENTOS
// ==========================================
function configurarEventosCriancas() {
    const btnNovo = document.getElementById("btnNovaCrianca");
    if (btnNovo) btnNovo.onclick = novaCrianca;

    const btnAtualizar = document.getElementById("btnAtualizarCriancas");
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            atualizarTabelaCriancas();
            atualizarIndicadoresCriancas();
        };
    }

    // Fechar e cancelar modais
    const fecharModalCadastro = document.getElementById("fecharModalCrianca");
    const cancelar = document.getElementById("cancelarCrianca");
    if (fecharModalCadastro) fecharModalCadastro.onclick = fecharModalCrianca;
    if (cancelar) cancelar.onclick = fecharModalCrianca;

    const fecharVis = document.getElementById("fecharVisualizarCrianca");
    const fecharVisRodape = document.getElementById("fecharVisualizarCriancaRodape");
    if (fecharVis) fecharVis.onclick = fecharModalVisualizacaoCrianca;
    if (fecharVisRodape) fecharVisRodape.onclick = fecharModalVisualizacaoCrianca;

    const fecharExc = document.getElementById("fecharExcluirCrianca");
    const cancelarExc = document.getElementById("cancelarExcluirCrianca");
    const confirmarExc = document.getElementById("confirmarExcluirCrianca");
    if (fecharExc) fecharExc.onclick = fecharModalExcluirCrianca;
    if (cancelarExc) cancelarExc.onclick = fecharModalExcluirCrianca;
    if (confirmarExc) confirmarExc.onclick = confirmarExclusaoCrianca;

    // Pesquisa em tempo real
    const pesquisa = document.getElementById("pesquisaCrianca");
    if (pesquisa) pesquisa.onkeyup = atualizarTabelaCriancas;

    // Submit do formulário de cadastro/edição
    const form = document.getElementById("formCrianca");
    if (form) form.onsubmit = salvarCrianca;
}

// ==========================================
// FUNÇÕES DE MODAL
// ==========================================
function novaCrianca() {
    criancaEditando = null;
    const form = document.getElementById("formCrianca");
    if (form) form.reset();
    abrirModalCrianca();
}

function abrirModalCrianca() {
    const modal = document.getElementById("modalCrianca");
    if (modal) modal.classList.add("ativo");
}

function fecharModalCrianca() {
    const modal = document.getElementById("modalCrianca");
    if (modal) modal.classList.remove("ativo");
    criancaEditando = null;
}

function abrirModalVisualizacaoCrianca() {
    const modal = document.getElementById("modalVisualizarCrianca");
    if (modal) modal.classList.add("ativo");
}

function fecharModalVisualizacaoCrianca() {
    const modal = document.getElementById("modalVisualizarCrianca");
    if (modal) modal.classList.remove("ativo");
}

function fecharModalExcluirCrianca() {
    criancaExcluir = null;
    const modal = document.getElementById("modalExcluirCrianca");
    if (modal) modal.classList.remove("ativo");
}

// ==========================================
// INDICADORES
// ==========================================
function atualizarIndicadoresCriancas() {
    if (!Banco || !Banco.dados || !Banco.dados.criancas) return;

    const total = Banco.dados.criancas.length;
    const comEscola = Banco.dados.criancas.filter(c => c.escola && c.escola.trim() !== "").length;

    const cardTotal = document.getElementById("cardTotalCriancas");
    const cardEscola = document.getElementById("cardComEscola");

    if (cardTotal) cardTotal.textContent = total;
    if (cardEscola) cardEscola.textContent = comEscola;
}

// ==========================================
// SALVAR CRIANÇA
// ==========================================
function salvarCrianca(e) {
    e.preventDefault();

    const objeto = {
        id: criancaEditando ?? gerarId("crianca"),
        nome: document.getElementById("nomeCrianca").value.trim(),
        nascimento: document.getElementById("nascimentoCrianca").value,
        cpf: document.getElementById("cpfCrianca").value.trim(),
        escola: document.getElementById("escolaCrianca").value.trim(),
        responsavel: document.getElementById("responsavelCrianca").value.trim(),
        observacoes: document.getElementById("observacoesCrianca").value.trim()
    };

    if (!objeto.nome || !objeto.nascimento || !objeto.escola || !objeto.responsavel) {
        alert("Preencha todos os campos obrigatórios (*).");
        return;
    }

    if (criancaEditando === null) {
        inserirRegistro("criancas", objeto);
    } else {
        atualizarRegistro("criancas", objeto);
    }

    atualizarTabelaCriancas();
    atualizarIndicadoresCriancas();
    fecharModalCrianca();
}

// ==========================================
// TABELA
// ==========================================
function atualizarTabelaCriancas() {
    const tbody = document.getElementById("listaCriancas");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!Banco || !Banco.dados || !Banco.dados.criancas) return;

    const termo = document.getElementById("pesquisaCrianca")?.value.toLowerCase() || "";

    let lista = Banco.dados.criancas.filter(item => {
        return (
            (item.nome && item.nome.toLowerCase().includes(termo)) ||
            (item.escola && item.escola.toLowerCase().includes(termo)) ||
            (item.cpf && item.cpf.toLowerCase().includes(termo)) ||
            (item.responsavel && item.responsavel.toLowerCase().includes(termo))
        );
    });

    lista.sort((a, b) => b.id - a.id);

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="vazio" style="text-align: center; padding: 20px; color: var(--texto-secundario);">
                    <i class="fa-regular fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                    Nenhuma criança cadastrada.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>${item.nome}</td>
            <td>${item.nascimento ? item.nascimento.split('-').reverse().join('/') : ''}</td>
            <td>${item.escola || '—'}</td>
            <td>${item.responsavel || '—'}</td>
            <td>
                <div class="tabela-acoes">
                    <button class="btn-acao-tabela btn-visualizar" onclick="visualizarCrianca(${item.id})" title="Visualizar">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-acao-tabela btn-editar" onclick="editarCrianca(${item.id})" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-acao-tabela btn-excluir" onclick="excluirCriancaModal(${item.id})" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// ==========================================
// BUSCAR CRIANÇA
// ==========================================
function buscarCrianca(id) {
    if (!Banco || !Banco.dados || !Banco.dados.criancas) return null;
    return Banco.dados.criancas.find(item => item.id === id);
}

// ==========================================
// VISUALIZAR
// ==========================================
function visualizarCrianca(id) {
    const item = buscarCrianca(id);
    if (!item) return;

    document.getElementById("verIdCrianca").value = `#${item.id}`;
    document.getElementById("verNascimentoCrianca").value = item.nascimento ? item.nascimento.split('-').reverse().join('/') : '';
    document.getElementById("verCpfCrianca").value = item.cpf || "Não informado";
    document.getElementById("verNomeCrianca").value = item.nome;
    document.getElementById("verEscolaCrianca").value = item.escola || '—';
    document.getElementById("verResponsavelCrianca").value = item.responsavel || '—';
    document.getElementById("verObservacoesCrianca").value = item.observacoes || "Nenhuma observação registrada.";

    abrirModalVisualizacaoCrianca();
}

// ==========================================
// EDITAR
// ==========================================
function editarCrianca(id) {
    const item = buscarCrianca(id);
    if (!item) return;

    criancaEditando = item.id;
    document.getElementById("nomeCrianca").value = item.nome;
    document.getElementById("nascimentoCrianca").value = item.nascimento;
    document.getElementById("cpfCrianca").value = item.cpf || "";
    document.getElementById("escolaCrianca").value = item.escola || "";
    document.getElementById("responsavelCrianca").value = item.responsavel || "";
    document.getElementById("observacoesCrianca").value = item.observacoes || "";

    abrirModalCrianca();
}

// ==========================================
// EXCLUIR
// ==========================================
function excluirCriancaModal(id) {
    criancaExcluir = id;
    const modal = document.getElementById("modalExcluirCrianca");
    if (modal) modal.classList.add("ativo");
}

function confirmarExclusaoCrianca() {
    if (criancaExcluir === null) return;

    removerRegistro("criancas", criancaExcluir);
    atualizarTabelaCriancas();
    atualizarIndicadoresCriancas();
    fecharModalExcluirCrianca();
}

// ==========================================================
// 🆕 FUNÇÃO PARA PREENCHER DO PDF
// ==========================================================
function preencherCriancaDoPDF(dados) {
    console.log('📝 Preenchendo formulário de criança com dados do PDF...');
    
    if (!dados) {
        console.warn('⚠️ Nenhum dado para preencher!');
        return;
    }

    // Abre o modal de cadastro
    const modal = document.getElementById('modalCrianca');
    if (modal) {
        modal.classList.add('ativo');
    }

    // Reseta o formulário
    const form = document.getElementById('formCrianca');
    if (form) {
        form.reset();
        criancaEditando = null;
    }

    // ==========================================
    // FUNÇÃO AUXILIAR: Converter Data
    // ==========================================
    function converterDataParaInput(dataStr) {
        if (!dataStr) return '';
        const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            return `${match[3]}-${match[2]}-${match[1]}`;
        }
        return dataStr;
    }

    // ==========================================
    // PREENCHER CAMPOS
    // ==========================================
    
    // 1. Nome
    const nomeInput = document.getElementById('nomeCrianca');
    if (nomeInput && dados.nome) {
        nomeInput.value = dados.nome;
        console.log(`✅ Nome preenchido: ${dados.nome}`);
    }

    // 2. Data de Nascimento
    const nascimentoInput = document.getElementById('nascimentoCrianca');
    if (nascimentoInput && dados.nascimento) {
        const dataFormatada = converterDataParaInput(dados.nascimento);
        if (dataFormatada) {
            nascimentoInput.value = dataFormatada;
            console.log(`✅ Nascimento preenchido: ${dataFormatada}`);
        }
    }

    // 3. Escola
    const escolaInput = document.getElementById('escolaCrianca');
    if (escolaInput && dados.escola) {
        escolaInput.value = dados.escola;
        console.log(`✅ Escola preenchida: ${dados.escola}`);
    }

    // 4. Responsável
    const responsavelInput = document.getElementById('responsavelCrianca');
    if (responsavelInput && dados.responsavel) {
        responsavelInput.value = dados.responsavel;
        console.log(`✅ Responsável preenchido: ${dados.responsavel}`);
    }

    // 5. Observações (monta com todas as informações)
    const observacoesInput = document.getElementById('observacoesCrianca');
    if (observacoesInput) {
        let obs = [];
        
        if (dados.observacao) obs.push(dados.observacao);
        if (dados.assunto) obs.push(`Assunto: ${dados.assunto}`);
        if (dados.endereco) obs.push(`Endereço: ${dados.endereco}`);
        if (dados.telefone) obs.push(`Telefone: ${dados.telefone}`);
        if (dados.dataAtendimento) obs.push(`Data do Atendimento: ${dados.dataAtendimento}`);
        if (dados.tipoAtendimento) obs.push(`Tipo de Atendimento: ${dados.tipoAtendimento}`);
        if (dados.plantonista) obs.push(`Plantonista: ${dados.plantonista}`);
        if (dados.processo) obs.push(`Nº Processo: ${dados.processo}`);
        if (dados.vara) obs.push(`Vara: ${dados.vara}`);
        if (dados.juiz) obs.push(`Juiz: ${dados.juiz}`);
        if (dados.promotor) obs.push(`Promotor: ${dados.promotor}`);
        if (dados.serie) obs.push(`Série: ${dados.serie}`);
        if (dados.contato) obs.push(`Contato: ${dados.contato}`);
        
        observacoesInput.value = obs.join('\n');
        console.log(`✅ Observações preenchidas`);
    }

    // ==========================================
    // ATUALIZA TÍTULO DO MODAL
    // ==========================================
    const tituloModal = document.querySelector('#modalCrianca .modal-header h2');
    if (tituloModal) {
        tituloModal.innerHTML = '<i class="fa-solid fa-child"></i> Criança / Adolescente (Dados do PDF)';
    }

    console.log('✅ Formulário de criança preenchido com sucesso!');
}

// ==========================================
// 🆕 FUNÇÃO PARA VERIFICAR SE HÁ DADOS DO PDF
// ==========================================
function verificarDadosPDF() {
    try {
        const dadosSalvos = localStorage.getItem('dadosPdfExtraidos');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            if (dados && dados.nome) {
                console.log('📄 Dados do PDF encontrados:', dados);
                return dados;
            }
        }
    } catch (e) {
        console.error('Erro ao verificar dados do PDF:', e);
    }
    return null;
}

// ==========================================
// 🆕 FUNÇÃO PARA CARREGAR DADOS DO PDF AUTOMATICAMENTE
// ==========================================
function carregarDadosPDFNoFormulario() {
    const dados = verificarDadosPDF();
    if (dados) {
        console.log('📄 Carregando dados do PDF automaticamente...');
        preencherCriancaDoPDF(dados);
    }
}

// ==========================================
// EXPORTA FUNÇÕES PARA O GLOBAL
// ==========================================
window.preencherCriancaDoPDF = preencherCriancaDoPDF;
window.verificarDadosPDF = verificarDadosPDF;
window.carregarDadosPDFNoFormulario = carregarDadosPDFNoFormulario;
window.novaCrianca = novaCrianca;
window.editarCrianca = editarCrianca;
window.visualizarCrianca = visualizarCrianca;
window.excluirCriancaModal = excluirCriancaModal;

console.log('👶 Módulo de Crianças com integração PDF carregado!');
