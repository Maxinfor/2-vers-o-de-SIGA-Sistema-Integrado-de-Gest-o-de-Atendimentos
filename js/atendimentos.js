/* ==========================================================
   ATENDIMENTOS
========================================================== */

function iniciarAtendimentos(){

    atualizarTabela();

    const btn = document.getElementById("btnNovo");

    if(btn){

        btn.onclick = abrirModal;

    }

    const fechar = document.getElementById("fecharModal");

    if(fechar){

        fechar.onclick = fecharModal;

    }

    const cancelar = document.getElementById("cancelar");

    if(cancelar){

        cancelar.onclick = fecharModal;

    }

    const form = document.getElementById("formAtendimento");

    if(form){

        form.onsubmit = salvarAtendimento;

    }

}

/* ==========================================================
   MODAL
========================================================== */

function abrirModal(){

    document

    .getElementById("modalAtendimento")

    .classList

    .add("ativo");

}

function fecharModal(){

    document

    .getElementById("modalAtendimento")

    .classList

    .remove("ativo");

}

/* ==========================================================
   SALVAR
========================================================== */

function salvarAtendimento(e){

    e.preventDefault();

    const atendimento={

        id: Banco.dados.atendimentos.length + 1,

        data: document.getElementById("data").value,

        hora: document.getElementById("hora").value,

        crianca: document.getElementById("crianca").value,

        responsavel: document.getElementById("responsavel").value,

        telefone: document.getElementById("telefone").value,

        status: document.getElementById("status").value,

        relato: document.getElementById("relato").value

    };

    Banco.dados.atendimentos.push(atendimento);

    salvarBanco();

    atualizarTabela();

    fecharModal();

    e.target.reset();

}

/* ==========================================================
   TABELA
========================================================== */

function atualizarTabela(){

    const tbody = document.getElementById("listaAtendimentos");

    if(!tbody) return;

    tbody.innerHTML = "";

    if(Banco.dados.atendimentos.length === 0){

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Nenhum atendimento cadastrado.
                </td>
            </tr>
        `;

        return;
    }

    Banco.dados.atendimentos.forEach(item=>{

        tbody.innerHTML += `
            <tr>

                <td>${item.id}</td>

                <td>${formatarData(item.data)}</td>

                <td>${item.crianca}</td>

                <td>${item.responsavel}</td>

                <td>
                    <span class="status ${corStatus(item.status)}">
                        ${item.status}
                    </span>
                </td>

                <td>

                    <button onclick="visualizar(${item.id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button onclick="editar(${item.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button onclick="excluir(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </td>

            </tr>
        `;

    });

}
