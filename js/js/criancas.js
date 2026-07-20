/* ==========================================================
   SIGACTPAR - MÓDULO DE CRIANÇAS E ADOLESCENTES
========================================================== */

let criancaEditando = null;
let criancaExcluir = null;

function iniciarCriancas() {
    configurarEventosCriancas();
    atualizarTabelaCriancas();
    atualizarIndicadoresCriancas();
}

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

function atualizarIndicadoresCriancas() {
    if (!Banco || !Banco.dados || !Banco.dados.criancas) return;

    const total = Banco.dados.criancas.length;
    const comEscola = Banco.dados.criancas.filter(c => c.escola && c.escola.trim() !== "").length;

    const cardTotal = document.getElementById("cardTotalCriancas");
    const cardEscola = document.getElementById("cardComEscola");

    if (cardTotal) cardTotal.textContent = total;
    if (cardEscola) cardEscola.textContent = comEscola;
}

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
            (item.cpf && item.cpf.toLowerCase().includes(termo))
        );
    });

    lista.sort((a, b) => b.id - a.id);

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="vazio" style="text-align: center; padding: 20px; color: var(--texto-secundario);">Nenhuma criança cadastrada.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>${item.nome}</td>
            <td>${item.nascimento ? item.nascimento.split('-').reverse().join('/') : ''}</td>
            <td>${item.escola}</td>
            <td>${item.responsavel}</td>
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

function buscarCrianca(id) {
    if (!Banco || !Banco.dados || !Banco.dados.criancas) return null;
    return Banco.dados.criancas.find(item => item.id === id);
}

function visualizarCrianca(id) {
    const item = buscarCrianca(id);
    if (!item) return;

    document.getElementById("verIdCrianca").value = `#${item.id}`;
    document.getElementById("verNascimentoCrianca").value = item.nascimento ? item.nascimento.split('-').reverse().join('/') : '';
    document.getElementById("verCpfCrianca").value = item.cpf || "Não informado";
    document.getElementById("verNomeCrianca").value = item.nome;
    document.getElementById("verEscolaCrianca").value = item.escola;
    document.getElementById("verResponsavelCrianca").value = item.responsavel;
    document.getElementById("verObservacoesCrianca").value = item.observacoes || "Nenhuma observação registrada.";

    abrirModalVisualizacaoCrianca();
}

function editarCrianca(id) {
    const item = buscarCrianca(id);
    if (!item) return;

    criancaEditando = item.id;
    document.getElementById("nomeCrianca").value = item.nome;
    document.getElementById("nascimentoCrianca").value = item.nascimento;
    document.getElementById("cpfCrianca").value = item.cpf || "";
    document.getElementById("escolaCrianca").value = item.escola;
    document.getElementById("responsavelCrianca").value = item.responsavel;
    document.getElementById("observacoesCrianca").value = item.observacoes || "";

    abrirModalCrianca();
}

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
