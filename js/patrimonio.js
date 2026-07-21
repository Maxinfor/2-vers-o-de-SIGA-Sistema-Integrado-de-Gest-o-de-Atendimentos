/* ==========================================================
   SIGACTPAR - MÓDULO DE PATRIMÔNIO
========================================================== */

let patrimonioEditando = null;

function iniciarPatrimonio() {
    configurarEventosPatrimonio();
    atualizarTabelaPatrimonio();
    atualizarIndicadoresPatrimonio();
}

function configurarEventosPatrimonio() {
    const btnNovo = document.getElementById("btnNovoPatrimonio");
    if (btnNovo) {
        btnNovo.onclick = () => {
            patrimonioEditando = null;
            const form = document.getElementById("formPatrimonio");
            if (form) form.reset();
            abrirModalPatrimonio();
        };
    }

    const btnAtualizar = document.getElementById("btnAtualizarPatrimonio");
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            atualizarTabelaPatrimonio();
            atualizarIndicadoresPatrimonio();
        };
    }

    const fechar = document.getElementById("fecharModalPatrimonio");
    const cancelar = document.getElementById("cancelarPatrimonio");
    if (fechar) fechar.onclick = fecharModalPatrimonio;
    if (cancelar) cancelar.onclick = fecharModalPatrimonio;

    const pesquisa = document.getElementById("pesquisaPatrimonio");
    if (pesquisa) pesquisa.onkeyup = atualizarTabelaPatrimonio;

    const form = document.getElementById("formPatrimonio");
    if (form) form.onsubmit = salvarPatrimonio;
}

function abrirModalPatrimonio() {
    const modal = document.getElementById("modalPatrimonio");
    if (modal) modal.classList.add("ativo");
}

function fecharModalPatrimonio() {
    const modal = document.getElementById("modalPatrimonio");
    if (modal) modal.classList.remove("ativo");
    patrimonioEditando = null;
}

function atualizarIndicadoresPatrimonio() {
    if (!Banco || !Banco.dados || !Banco.dados.patrimonio) return;

    const total = Banco.dados.patrimonio.length;
    const bomEstado = Banco.dados.patrimonio.filter(item => item.estado === "Bom").length;

    const cardTotal = document.getElementById("cardTotalPatrimonio");
    const cardBom = document.getElementById("cardPatrimonioBom");

    if (cardTotal) cardTotal.textContent = total;
    if (cardBom) cardBom.textContent = bomEstado;
}

function salvarPatrimonio(e) {
    e.preventDefault();

    const objeto = {
        id: patrimonioEditando ?? gerarId("patrimonio"),
        tombamento: document.getElementById("tombamentoPatrimonio").value.trim(),
        categoria: document.getElementById("categoriaPatrimonio").value,
        descricao: document.getElementById("descricaoPatrimonio").value.trim(),
        estado: document.getElementById("estadoPatrimonio").value,
        localizacao: document.getElementById("localizacaoPatrimonio").value.trim()
    };

    if (patrimonioEditando === null) {
        inserirRegistro("patrimonio", objeto);
    } else {
        atualizarRegistro("patrimonio", objeto);
    }

    atualizarTabelaPatrimonio();
    atualizarIndicadoresPatrimonio();
    fecharModalPatrimonio();
}

function atualizarTabelaPatrimonio() {
    const tbody = document.getElementById("listaPatrimonio");
    if (!tbody || !Banco || !Banco.dados || !Banco.dados.patrimonio) return;

    tbody.innerHTML = "";
    const termo = document.getElementById("pesquisaPatrimonio")?.value.toLowerCase() || "";

    let lista = Banco.dados.patrimonio.filter(item => 
        (item.tombamento && item.tombamento.toLowerCase().includes(termo)) ||
        (item.descricao && item.descricao.toLowerCase().includes(termo)) ||
        (item.categoria && item.categoria.toLowerCase().includes(termo)) ||
        (item.localizacao && item.localizacao.toLowerCase().includes(termo))
    );

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--texto-secundario);">Nenhum bem patrimonial cadastrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
            <td><strong>${item.tombamento}</strong></td>
            <td>${item.descricao}</td>
            <td>${item.categoria}</td>
            <td><span class="badge ${item.estado === 'Bom' ? 'verde' : item.estado === 'Regular' ? 'amarelo' : 'vermelho'}">${item.estado}</span></td>
            <td>${item.localizacao}</td>
            <td>
                <div class="tabela-acoes">
                    <button class="btn-acao-tabela btn-excluir" onclick="removerRegistro('patrimonio', ${item.id}); atualizarTabelaPatrimonio(); atualizarIndicadoresPatrimonio();" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}
