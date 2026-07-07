// ====================================
// SIGA - Sistema de Gestão
// Controle principal
// ====================================


// Banco inicial de dados
let atendimentos = JSON.parse(
    localStorage.getItem("siga_atendimentos")
) || [];



// ====================================
// Atualizar Dashboard
// ====================================

function atualizarDashboard(){


    // Total de atendimentos

    document.getElementById("total").innerHTML =
        atendimentos.length;



    // Data atual

    let hoje = new Date();

    let dataHoje =
        hoje.toISOString().split("T")[0];



    // Atendimentos de hoje

    let totalHoje =
        atendimentos.filter(item =>
            item.data === dataHoje
        ).length;



    document.getElementById("hoje").innerHTML =
        totalHoje;



    // Atendimentos do mês

    let mesAtual =
        hoje.getMonth();

    let anoAtual =
        hoje.getFullYear();



    let totalMes =
        atendimentos.filter(item=>{


            let data =
            new Date(item.data);



            return (

                data.getMonth() === mesAtual
                &&
                data.getFullYear() === anoAtual

            );


        }).length;



    document.getElementById("mes").innerHTML =
        totalMes;


}



// ====================================
// Últimos atendimentos
// ====================================


function carregarTabela(){


    let tabela =
    document.getElementById("tabela");


    tabela.innerHTML="";



    atendimentos
    .slice(-5)
    .reverse()
    .forEach(item=>{


        tabela.innerHTML += `

        <tr>

            <td>${item.data || ""}</td>

            <td>${item.nome || ""}</td>

            <td>${item.responsavel || ""}</td>

            <td>${item.assunto || ""}</td>

            <td>${item.plantonista || ""}</td>

        </tr>

        `;


    });


}



// ====================================
// Salvar banco
// ====================================


function salvarDados(){


    localStorage.setItem(

        "siga_atendimentos",

        JSON.stringify(atendimentos)

    );


}



// ====================================
// Inicialização
// ====================================


function iniciarSIGA(){


    atualizarDashboard();

    carregarTabela();


}



iniciarSIGA();
