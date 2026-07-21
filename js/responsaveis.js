/* ==========================================================
   SIGACTPAR
   MÓDULO DE RESPONSÁVEIS
========================================================== */

let responsavelEditando = null;
let responsavelExcluir = null;

function iniciarResponsaveis() {
    configurarEventosResponsaveis();
    atualizarTabelaResponsaveis();
    atualizarIndicadoresResponsaveis();
}

function configurarEventosResponsaveis() {
    const btnNovo = document.getElementById("btnNovoResponsavel");
    if (btnNovo) btnNovo.onclick = novoResponsavel;

    const btnAtualizar = document.getElementById("btnAtualizarResponsaveis");
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            atualizarTabelaResponsaveis();
            atualizarIndicadoresResponsaveis();
        };
    }

    // Fechar modais
    const fecharModalCadastro = document.getElementById("fecharModalResponsavel");
    const cancelar = document.getElementById("cancelarResponsavel");
    if (fecharModalCadastro) fecharModalCadastro.onclick = fecharModalResponsavel;
    if (cancelar) cancelar.onclick = fecharModalResponsavel;

    const fecharVis = document.getElementById("fecharVisualizarResponsavel");
    const fecharVisRodape = document.getElementById("fecharVisualizarResponsavelRodape");
    if (fecharVis) fecharVis.onclick = fecharModalVisualizacaoResponsavel;
    if (fecharVisRodape) fecharVisRodape.onclick = fecharModalVisualizacaoResponsavel;

    const fecharExc = document.getElementById("fecharExcluirResponsavel");
    const cancelarExc = document.getElementById("cancelarExcluirResponsavel");
    const confirmarExc = document.getElementById("confirmarExcluirResponsavel");
    if (fecharExc) fecharExc.onclick = fecharModalExcluirResponsavel;
    if (cancelarExc) cancelarExc.onclick = fecharModalExcluirResponsavel;
    if (confirmarExc) confirmarExc.onclick = confirmarExclusaoResponsavel;

    // Pesquisa
    const pesquisa = document.getElementById("pesquisaResponsavel");
    if (pesquisa) pesquisa.onkeyup = atualizarTabelaResponsaveis;

    // Submit formulário
    const form = document.getElementById("formResponsavel");
    if (form) form.onsubmit = salvarResponsavel;
}

function novoResponsavel() {
    responsavelEditando = null;
    const form = document.getElementById("formResponsavel");
    if (form) form.reset();
    abrirModalResponsavel();
}

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
    responsavelExcluir = null;
    const modal = document.getElementById("modalExcluirResponsavel");
    if (modal) modal.classList.remove("ativo");
}

function atualizarIndicadoresResponsaveis() {
    const total = Banco.dados.responsaveis.length;
    const comContato = Banco.dados.responsaveis.filter(r => r.telefone && r.telefone.trim() !== "").length;

    const cardTotal = document.getElementById("cardTotalResponsaveis");
    const cardContato = document.getElementById("cardComContato");

    if (cardTotal) cardTotal.textContent = total;
    if (cardContato) cardContato.textContent = comContato;
}

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
        alert("Preencha todos os campos obrigatórios (*).");
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

function atualizarTabelaResponsaveis() {
    const tbody = document.getElementById("listaResponsaveis");
    if (!tbody) return;

    tbody.innerHTML = "";
    const termo = document.getElementById("pesquisaResponsavel")?.value.toLowerCase() || "";

    let lista = Banco.dados.responsaveis.filter(item => {
        return (
            (item.nome && item.nome.toLowerCase().includes(termo)) ||
            (item.cpf && item.cpf.toLowerCase().includes(termo)) ||
            (item.telefone && item.telefone.toLowerCase().includes(termo))
        );
    });

    lista.sort((a, b) => b.id - a.id);

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="vazio">Nenhum responsável cadastrado.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>${item.nome}</td>
            <td>${item.cpf}</td>
            <td>${item.telefone}</td>
            <td>${item.endereco}</td>
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

function visualizarResponsavel(id) {
    const item = buscarResponsavel(id);
    if (!item) return;

    document.getElementById("verIdResponsavel").value = `#${item.id}`;
    document.getElementById("verCpfResponsavel").value = item.cpf;
    document.getElementById("verNomeResponsavel").value = item.nome;
    document.getElementById("verTelefoneResponsavel").value = item.telefone;
    document.getElementById("verEnderecoResponsavel").value = item.endereco;
    document.getElementById("verObservacoesResponsavel").value = item.observacoes || "Nenhuma observação registrada.";

    abrirModalVisualizacaoResponsavel();
}

function editarResponsavel(id) {
    const item = buscarResponsavel(id);
    if (!item) return;

    responsavelEditando = item.id;
    document.getElementById("nomeResponsavel").value = item.nome;
    document.getElementById("cpfResponsavel").value = item.cpf;
    document.getElementById("telefoneResponsavel").value = item.telefone;
    document.getElementById("enderecoResponsavel").value = item.endereco;
    document.getElementById("observacoesResponsavel").value = item.observacoes;

    abrirModalResponsavel();
}

function excluirResponsavelModal(id) {
    responsavelExcluir = id;
    const modal = document.getElementById("modalExcluirResponsavel");
    if (modal) modal.classList.add("ativo");
}

function confirmarExclusaoResponsavel() {
    if (responsavelExcluir === null) return;

    removerRegistro("responsaveis", responsavelExcluir);
    atualizarTabelaResponsaveis();
    atualizarIndicadoresResponsaveis();
    fecharModalExcluirResponsavel();
}
