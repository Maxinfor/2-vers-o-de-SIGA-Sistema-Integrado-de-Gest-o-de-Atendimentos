/* =====================================================
   SIGA - Cadastro de Atendimentos
   ===================================================== */

document.addEventListener("DOMContentLoaded", iniciarCadastro);

function iniciarCadastro() {

    verificarLogin();

    preencherDataAtual();

}

/* ==========================================
   Preencher data automaticamente
========================================== */

function preencherDataAtual() {

    const campo = document.getElementById("data");

    if (!campo.value) {

        campo.value = new Date().toISOString().split("T")[0];

    }

}

/* ==========================================
   Gerar ID
========================================== */

function gerarID() {

    return Date.now();

}

/* ==========================================
   Salvar Atendimento
========================================== */

function salvarAtendimento() {

    const atendimento = {

        id: gerarID(),

        data: document.getElementById("data").value,

        nome: document.getElementById("nome").value.trim(),

        nascimento: document.getElementById("nascimento").value,

        responsavel: document.getElementById("responsavel").value.trim(),

        endereco: document.getElementById("endereco").value.trim(),

        localidade: document.getElementById("localidade").value.trim(),

        contato: document.getElementById("contato").value.trim(),

        contato2: document.getElementById("contato2").value.trim(),

        assunto: document.getElementById("assunto").value,

        tipo: document.getElementById("tipo").value,

        plantonista: document.getElementById("plantonista").value.trim(),

        observacoes: document.getElementById("observacoes").value.trim(),

        usuario: localStorage.getItem("siga_nome") || "Administrador",

        dataCadastro: new Date().toLocaleString("pt-BR"),

        status: "Aberto"

    };

    /* ========= Validação ========= */

    if (atendimento.nome === "") {

        alert("Informe o nome.");

        return;

    }

    if (atendimento.responsavel === "") {

        alert("Informe o responsável.");

        return;

    }

    if (atendimento.localidade === "") {

        alert("Informe a localidade.");

        return;

    }

    /* ========= Salvar ========= */

    let atendimentos = JSON.parse(localStorage.getItem("siga_atendimentos")) || [];

    atendimentos.push(atendimento);

    localStorage.setItem(
        "siga_atendimentos",
        JSON.stringify(atendimentos)
    );

    alert("Atendimento salvo com sucesso!");

    limparFormulario();

}

/* ==========================================
   Limpar formulário
========================================== */

function limparFormulario() {

    document.getElementById("formCadastro").reset();

    preencherDataAtual();

}

/* ==========================================
   Carregar Atendimento por ID (preparado para edição)
========================================== */

function carregarAtendimento(id) {

    let atendimentos = JSON.parse(localStorage.getItem("siga_atendimentos")) || [];

    return atendimentos.find(a => a.id == id);

}
