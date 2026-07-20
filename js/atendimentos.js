/* ==========================================================
   SIGACTPAR
   MÓDULO DE ATENDIMENTOS
   Parte 1 - Estrutura Inicial
========================================================== */

let atendimentoEditando = null;
let atendimentoExcluir = null;

/* ==========================================================
   INICIAR MÓDULO
========================================================== */

function iniciarAtendimentos() {

    configurarEventos();

    atualizarTabela();

    atualizarIndicadores();

}

/* ==========================================================
   CONFIGURA EVENTOS
========================================================== */

function configurarEventos() {

    // Novo Atendimento
    const btnNovo = document.getElementById("btnNovo");

    if (btnNovo) {
        btnNovo.onclick = novoAtendimento;
    }

    // Atualizar
    const btnAtualizar = document.getElementById("btnAtualizar");

    if (btnAtualizar) {

        btnAtualizar.onclick = () => {

            atualizarTabela();

            atualizarIndicadores();

        };

    }

    // Fechar Modal Cadastro
    const fecharModalCadastro = document.getElementById("fecharModal");

    if (fecharModalCadastro) {

        fecharModalCadastro.onclick = fecharModal;

    }

    // Cancelar Cadastro
    const cancelar = document.getElementById("cancelar");

    if (cancelar) {

        cancelar.onclick = fecharModal;

    }

    // Fechar Modal Visualização
    const fecharVisualizar = document.getElementById("fecharVisualizar");

    if (fecharVisualizar) {

        fecharVisualizar.onclick = fecharVisualizacao;

    }

    // Botão Fechar Rodapé
    const fecharRodape = document.getElementById("fecharVisualizarRodape");

    if (fecharRodape) {

        fecharRodape.onclick = fecharVisualizacao;

    }

    // Pesquisa
    const pesquisa = document.getElementById("pesquisa");

    if (pesquisa) {

        pesquisa.onkeyup = atualizarTabela;

    }

    // Filtro Status
    const filtroStatus = document.getElementById("filtroStatus");

    if (filtroStatus) {

        filtroStatus.onchange = atualizarTabela;

    }

    // Filtro Tipo
    const filtroTipo = document.getElementById("filtroTipo");

    if (filtroTipo) {

        filtroTipo.onchange = atualizarTabela;

    }

    // Filtro Plantonista
    const filtroPlantonista = document.getElementById("filtroPlantonista");

    if (filtroPlantonista) {

        filtroPlantonista.onchange = atualizarTabela;

    }

    // Formulário
    const formulario = document.getElementById("formAtendimento");

    if (formulario) {

        formulario.onsubmit = salvarAtendimento;

    }

}

/* ==========================================================
   NOVO ATENDIMENTO
========================================================== */

function novoAtendimento() {

    atendimentoEditando = null;

    const form = document.getElementById("formAtendimento");

    if (form) {

        form.reset();

    }

    const numero = document.getElementById("numero");

    if (numero) {

        numero.value = gerarNumero();

    }

    const data = document.getElementById("data");

    if (data) {

        data.value = new Date().toISOString().substring(0, 10);

    }

    const hora = document.getElementById("hora");

    if (hora) {

        hora.value = new Date().toLocaleTimeString("pt-BR", {

            hour: "2-digit",

            minute: "2-digit"

        });

    }

    abrirModal();

}

/* ==========================================================
   MODAIS
========================================================== */

function abrirModal() {

    document
        .getElementById("modalAtendimento")
        .classList
        .add("ativo");

}

function fecharModal() {

    document
        .getElementById("modalAtendimento")
        .classList
        .remove("ativo");

}

function abrirVisualizacao() {

    document
        .getElementById("modalVisualizar")
        .classList
        .add("ativo");

}

function fecharVisualizacao() {

    document
        .getElementById("modalVisualizar")
        .classList
        .remove("ativo");

}

/* ==========================================================
   GERAR NÚMERO DO ATENDIMENTO
========================================================== */

function gerarNumero() {

    const numero = Banco.dados.atendimentos.length + 1;

    return "AT-" + String(numero).padStart(6, "0");

}

/* ==========================================================
   ATUALIZAR INDICADORES
========================================================== */

function atualizarIndicadores() {

    // Será implementado na Parte 2

}

/* ==========================================================
   SALVAR ATENDIMENTO
========================================================== */

function salvarAtendimento(e) {

    e.preventDefault();

    // Será implementado na Parte 2

}

/* ==========================================================
   ATUALIZAR TABELA
========================================================== */

function atualizarTabela() {

    // Será implementado na Parte 3

}

/* ==========================================================
   VISUALIZAR
========================================================== */

function visualizar(id) {

    // Será implementado na Parte 4

}

/* ==========================================================
   EDITAR
========================================================== */

function editar(id) {

    // Será implementado na Parte 5

}

/* ==========================================================
   EXCLUIR
========================================================== */

function excluir(id) {

    // Será implementado na Parte 6

}

/* ==========================================================
   FUNÇÕES AUXILIARES
========================================================== */

function formatarData(data) {

    if (!data) return "";

    const partes = data.split("-");

    return partes[2] + "/" + partes[1] + "/" + partes[0];

}

function corStatus(status) {

    switch (status) {

        case "Concluído":
            return "status-verde";

        case "Encaminhado":
            return "status-laranja";

        case "Pendente":
            return "status-vermelho";

        default:
            return "status-azul";

    }

}
