/* ==========================================================
   SIGACTPAR
   MÓDULO DE PROCESSOS
========================================================== */

let processoEditando = null;
let processoExcluir = null;

function iniciarProcessos() {
    configurarEventosProcessos();
    atualizarTabelaProcessos();
    atualizarIndicadoresProcessos();
}

function configurarEventosProcessos() {
    const btnNovo = document.getElementById("btnNovoProcesso");
    if (btnNovo) btnNovo.onclick = novoProcesso;

    const btnAtualizar = document.getElementById("btnAtualizarProcessos");
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            atualizarTabelaProcessos();
            atualizarIndicadoresProcessos();
        };
    }

    // Fechar modais
    const fecharModalCadastro = document.getElementById("fecharModalProcesso");
    const cancelar = document.getElementById("cancelarProcesso");
    if (fecharModalCadastro) fecharModalCadastro.onclick = fecharModalProcesso;
    if (cancelar) cancelar.onclick = fecharModalProcesso;

    const fecharVis = document.getElementById("fecharVisualizarProcesso");
    const fecharVisRodape = document.getElementById("fecharVisualizarProcessoRodape");
    if (fecharVis) fecharVis.onclick = fecharModalVisualizacaoProcesso;
    if (fecharVisRodape) fecharVisRodape.onclick = fecharModalVisualizacaoProcesso;

    const fecharExc = document.getElementById("fecharExcluirProcesso");
    const cancelarExc = document.getElementById("cancelarExcluirProcesso");
    const confirmarExc = document.getElementById("confirmarExcluirProcesso");
    if (fecharExc) fecharExc.onclick = fecharModalExcluirProcesso;
    if (cancelarExc) cancelarExc.onclick = fecharModalExcluirProcesso;
    if (confirmarExc) confirmarExc.onclick = confirmarExclusaoProcesso;

    // Filtros e Pesquisa
    const pesquisa = document.getElementById("pesquisaProcesso");
    if (pesquisa) pesquisa.onkeyup = atualizarTabelaProcessos;

    const filtroStatus = document.getElementById("filtroStatusProcesso");
    if (filtroStatus) filtroStatus.onchange = atualizarTabelaProcessos;

    // Submit formulário
    const form = document.getElementById("formProcesso");
    if (form) form.onsubmit = salvarProcesso;
}

function novoProcesso() {
    processoEditando = null;
    const form = document.getElementById("formProcesso");
    if (form) form.reset();

    const data = document.getElementById("dataProcesso");
    if (data) data.value = new Date().toISOString().substring(0, 10);

    const numero = document.getElementById("numeroProcesso");
    if (numero) {
        const ano = new Date().getFullYear();
        const total = Banco.dados.processos.length + 1;
        numero.value = `PROC-${ano}/${String(total).padStart(3, "0")}`;
    }

    abrirModalProcesso();
}

function abrirModalProcesso() {
    const modal = document.getElementById("modalProcesso");
    if (modal) modal.classList.add("ativo");
}

function fecharModalProcesso() {
    const modal = document.getElementById("modalProcesso");
    if (modal) modal.classList.remove("ativo");
    processoEditando = null;
}

function abrirModalVisualizacaoProcesso() {
    const modal = document.getElementById("modalVisualizarProcesso");
    if (modal) modal.classList.add("ativo");
}

function fecharModalVisualizacaoProcesso() {
    const modal = document.getElementById("modalVisualizarProcesso");
    if (modal) modal.classList.remove("ativo");
}

function fecharModalExcluirProcesso() {
    processoExcluir = null;
    const modal = document.getElementById("modalExcluirProcesso");
    if (modal) modal.classList.remove("ativo");
}

function atualizarIndicadoresProcessos() {
    const total = Banco.dados.processos.length;
    const emAndamento = Banco.dados.processos.filter(p => p.status === "Em Andamento").length;

    const cardTotal = document.getElementById("cardTotalProcessos");
    const cardAndamento = document.getElementById("cardProcessosAndamento");

    if (cardTotal) cardTotal.textContent = total;
    if (cardAndamento) cardAndamento.textContent = emAndamento;
}

function salvarProcesso(e) {
    e.preventDefault();

    const objeto = {
        id: processoEditando ?? gerarId("processo"),
        numero: document.getElementById("numeroProcesso").value.trim(),
        data: document.getElementById("dataProcesso").value,
        status: document.getElementById("statusProcesso").value,
        interessado: document.getElementById("interessadoProcesso").value.trim(),
        assunto: document.getElementById("assuntoProcesso").value.trim(),
        descricao: document.getElementById("descricaoProcesso").value.trim()
    };

    if (!objeto.numero || !objeto.data || !objeto.interessado || !objeto.assunto || !objeto.descricao) {
        alert("Preencha todos os campos obrigatórios (*).");
        return;
    }

    if (processoEditando === null) {
        inserirRegistro("processos", objeto);
    } else {
        atualizarRegistro("processos", objeto);
    }

    atualizarTabelaProcessos();
    atualizarIndicadoresProcessos();
    fecharModalProcesso();
}

function atualizarTabelaProcessos() {
    const tbody = document.getElementById("listaProcessos");
    if (!tbody) return;

    tbody.innerHTML = "";
    const termo = document.getElementById("pesquisaProcesso")?.value.toLowerCase() || "";
    const filtroStatus = document.getElementById("filtroStatusProcesso")?.value || "";

    let lista = Banco.dados.processos.filter(item => {
        const textoMatch = 
            (item.numero && item.numero.toLowerCase().includes(termo)) ||
            (item.interessado && item.interessado.toLowerCase().includes(termo)) ||
            (item.assunto && item.assunto.toLowerCase().includes(termo));

        const statusMatch = filtroStatus === "" || item.status === filtroStatus;

        return textoMatch && statusMatch;
    });

    lista.sort((a, b) => b.id - a.id);

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="vazio">Nenhum processo encontrado.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
            <td><strong>${item.numero}</strong></td>
            <td>${formatarDataProcesso(item.data)}</td>
            <td>${item.assunto}</td>
            <td>${item.interessado}</td>
            <td><span class="status ${corStatusProcesso(item.status)}">${item.status}</span></td>
            <td>
                <div class="tabela-acoes">
                    <button class="btn-acao-tabela btn-visualizar" onclick="visualizarProcesso(${item.id})" title="Visualizar">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-acao-tabela btn-editar" onclick="editarProcesso(${item.id})" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-acao-tabela btn-excluir" onclick="excluirProcessoModal(${item.id})" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function visualizarProcesso(id) {
    const item = buscarProcesso(id);
    if (!item) return;

    document.getElementById("verNumeroProcesso").value = item.numero;
    document.getElementById("verDataProcesso").value = formatarDataProcesso(item.data);
    document.getElementById("verStatusProcesso").value = item.status;
    document.getElementById("verInteressadoProcesso").value = item.interessado;
    document.getElementById("verAssuntoProcesso").value = item.assunto;
    document.getElementById("verDescricaoProcesso").value = item.descricao;

    abrirModalVisualizacaoProcesso();
}

function editarProcesso(id) {
    const item = buscarProcesso(id);
    if (!item) return;

    processoEditando = item.id;
    document.getElementById("numeroProcesso").value = item.numero;
    document.getElementById("dataProcesso").value = item.data;
    document.getElementById("statusProcesso").value = item.status;
    document.getElementById("interessadoProcesso").value = item.interessado;
    document.getElementById("assuntoProcesso").value = item.assunto;
    document.getElementById("descricaoProcesso").value = item.descricao;

    abrirModalProcesso();
}

function excluirProcessoModal(id) {
    processoExcluir = id;
    const modal = document.getElementById("modalExcluirProcesso");
    if (modal) modal.classList.add("ativo");
}

function confirmarExclusaoProcesso() {
    if (processoExcluir === null) return;

    removerRegistro("processos", processoExcluir);
    atualizarTabelaProcessos();
    atualizarIndicadoresProcessos();
    fecharModalExcluirProcesso();
}

function formatarDataProcesso(data) {
    if (!data) return "";
    const partes = data.split("-");
    if (partes.length !== 3) return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function corStatusProcesso(status) {
    switch (status) {
        case "Concluído": return "status-verde";
        case "Arquivado": return "status-azul";
        default: return "status-laranja";
    }
}
