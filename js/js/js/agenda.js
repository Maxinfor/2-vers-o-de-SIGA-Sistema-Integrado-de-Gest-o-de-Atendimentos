/* ==========================================================
   SIGACTPAR - MÓDULO DE AGENDA
========================================================== */

function iniciarAgenda() {
    configurarEventosAgenda();
    atualizarTabelaAgenda();
}

function configurarEventosAgenda() {
    const btnNovo = document.getElementById("btnNovoCompromisso");
    if (btnNovo) btnNovo.onclick = () => { document.getElementById("formAgenda").reset(); document.getElementById("modalAgenda").classList.add("ativo"); };

    const fechar = document.getElementById("fecharModalAgenda");
    const cancelar = document.getElementById("cancelarAgenda");
    if (fechar) fechar.onclick = () => document.getElementById("modalAgenda").classList.remove("ativo");
    if (cancelar) cancelar.onclick = () => document.getElementById("modalAgenda").classList.remove("ativo");

    const form = document.getElementById("formAgenda");
    if (form) form.onsubmit = (e) => {
        e.preventDefault();
        const obj = {
            id: gerarId("agenda"),
            titulo: document.getElementById("tituloAgenda").value,
            dataHora: document.getElementById("dataAgenda").value,
            local: document.getElementById("localAgenda").value
        };
        inserirRegistro("agenda", obj);
        document.getElementById("modalAgenda").classList.remove("ativo");
        atualizarTabelaAgenda();
    };
}

function atualizarTabelaAgenda() {
    const tbody = document.getElementById("listaAgenda");
    if (!tbody || !Banco || !Banco.dados || !Banco.dados.agenda) return;

    tbody.innerHTML = Banco.dados.agenda.length === 0 ? 
        `<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum compromisso agendado.</td></tr>` :
        Banco.dados.agenda.map(item => `
            <tr>
                <td>${item.dataHora}</td>
                <td><strong>${item.titulo}</strong></td>
                <td>${item.local}</td>
                <td>Conselheiro(a) Plantonista</td>
                <td>
                    <button class="btn-acao-tabela btn-excluir" onclick="removerRegistro('agenda', ${item.id}); atualizarTabelaAgenda();"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join("");
}
