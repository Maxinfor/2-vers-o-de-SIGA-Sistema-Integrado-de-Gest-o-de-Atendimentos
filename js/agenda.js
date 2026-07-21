/* ==========================================================
   SIGACTPAR - MÓDULO DE AGENDA (COMPLETO COM EDIÇÃO)
========================================================== */

let agendaEditando = null;

function iniciarAgenda() {
    configurarEventosAgenda();
    atualizarTabelaAgenda();
    atualizarIndicadoresAgenda();
}

function configurarEventosAgenda() {
    const btnNovo = document.getElementById("btnNovoCompromisso");
    if (btnNovo) {
        btnNovo.onclick = () => {
            agendaEditando = null;
            const form = document.getElementById("formAgenda");
            if (form) form.reset();
            const modal = document.getElementById("modalAgenda");
            if (modal) modal.classList.add("ativo");
        };
    }

    const btnAtualizar = document.getElementById("btnAtualizarAgenda");
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            atualizarTabelaAgenda();
            atualizarIndicadoresAgenda();
        };
    }

    const fechar = document.getElementById("fecharModalAgenda");
    const cancelar = document.getElementById("cancelarAgenda");
    if (fechar) {
        fechar.onclick = () => {
            const modal = document.getElementById("modalAgenda");
            if (modal) modal.classList.remove("ativo");
            agendaEditando = null;
        };
    }
    if (cancelar) {
        cancelar.onclick = () => {
            const modal = document.getElementById("modalAgenda");
            if (modal) modal.classList.remove("ativo");
            agendaEditando = null;
        };
    }

    const pesquisa = document.getElementById("pesquisaAgenda");
    if (pesquisa) pesquisa.onkeyup = atualizarTabelaAgenda;

    const form = document.getElementById("formAgenda");
    if (form) form.onsubmit = salvarCompromisso;
}

function atualizarIndicadoresAgenda() {
    if (!Banco || !Banco.dados || !Banco.dados.agenda) return;
    const total = Banco.dados.agenda.length;
    
    const cardTotal = document.getElementById("cardTotalAgenda");
    const cardProximos = document.getElementById("cardAgendaProximos");

    if (cardTotal) cardTotal.textContent = total;
    if (cardProximos) cardProximos.textContent = total;
}

function salvarCompromisso(e) {
    e.preventDefault();

    const dataHoraRaw = document.getElementById("dataAgenda").value;
    // Formata a data/hora para padrão brasileiro (DD/MM/AAAA HH:MM)
    let dataFormatada = dataHoraRaw;
    if (dataHoraRaw) {
        const [dataPart, horaPart] = dataHoraRaw.split("T");
        if (dataPart && horaPart) {
            dataFormatada = `${dataPart.split("-").reverse().join("/")} às ${horaPart}`;
        }
    }

    const objeto = {
        id: agendaEditando ?? gerarId("agenda"),
        titulo: document.getElementById("tituloAgenda").value.trim(),
        dataHoraRaw: dataHoraRaw,
        dataHora: dataFormatada,
        local: document.getElementById("localAgenda").value.trim(),
        responsavel: document.getElementById("responsavelAgenda").value.trim() || "Conselheiro(a) Plantonista"
    };

    if (agendaEditando === null) {
        inserirRegistro("agenda", objeto);
    } else {
        atualizarRegistro("agenda", objeto);
    }

    const modal = document.getElementById("modalAgenda");
    if (modal) modal.classList.remove("ativo");
    agendaEditando = null;

    atualizarTabelaAgenda();
    atualizarIndicadoresAgenda();
}

function editarCompromisso(id) {
    if (!Banco || !Banco.dados || !Banco.dados.agenda) return;
    const item = Banco.dados.agenda.find(a => Number(a.id) === Number(id));
    if (!item) return;

    agendaEditando = item.id;

    const inputTitulo = document.getElementById("tituloAgenda");
    const inputData = document.getElementById("dataAgenda");
    const inputLocal = document.getElementById("localAgenda");
    const inputResponsavel = document.getElementById("responsavelAgenda");

    if (inputTitulo) inputTitulo.value = item.titulo || "";
    if (inputData) inputData.value = item.dataHoraRaw || "";
    if (inputLocal) inputLocal.value = item.local || "";
    if (inputResponsavel) inputResponsavel.value = item.responsavel || "";

    const modal = document.getElementById("modalAgenda");
    if (modal) modal.classList.add("ativo");
}

function atualizarTabelaAgenda() {
    const tbody = document.getElementById("listaAgenda");
    if (!tbody || !Banco || !Banco.dados || !Banco.dados.agenda) return;

    tbody.innerHTML = "";
    const termo = document.getElementById("pesquisaAgenda")?.value.toLowerCase() || "";

    let lista = Banco.dados.agenda.filter(item => 
        (item.titulo && item.titulo.toLowerCase().includes(termo)) ||
        (item.local && item.local.toLowerCase().includes(termo)) ||
        (item.responsavel && item.responsavel.toLowerCase().includes(termo))
    );

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--texto-secundario);">Nenhum compromisso agendado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
            <td><strong>${item.dataHora}</strong></td>
            <td>${item.titulo}</td>
            <td>${item.local}</td>
            <td>${item.responsavel}</td>
            <td>
                <div class="tabela-acoes">
                    <button class="btn-acao-tabela btn-editar" onclick="editarCompromisso(${item.id})" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-acao-tabela btn-excluir" onclick="removerRegistro('agenda', ${item.id}); atualizarTabelaAgenda(); atualizarIndicadoresAgenda();" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}
