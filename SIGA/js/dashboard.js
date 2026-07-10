/* =====================================================
   SIGA - Dashboard
   ===================================================== */

let atendimentos = JSON.parse(localStorage.getItem("siga_atendimentos")) || [];

document.addEventListener("DOMContentLoaded", () => {

    verificarLogin();

    carregarUsuario();

    mostrarData();

    atualizarDashboard();

});


/* ==========================================
   Atualiza todo Dashboard
========================================== */

function atualizarDashboard(){

    atualizarKPIs();

    carregarTabela();

    criarGraficoTipos();

    criarGraficoLocalidades();

    criarGraficoAssuntos();

}


/* ==========================================
   KPIs
========================================== */

function atualizarKPIs(){

    const hoje = new Date();

    const dataHoje = hoje.toISOString().split("T")[0];

    const mesAtual = hoje.getMonth()+1;

    const anoAtual = hoje.getFullYear();


    document.getElementById("totalAtendimentos").innerText =
    atendimentos.length;


    const hojeTotal =
    atendimentos.filter(a => a.data == dataHoje);

    document.getElementById("atendimentosHoje").innerText =
    hojeTotal.length;


    const mesTotal =
    atendimentos.filter(a=>{

        if(!a.data) return false;

        const d = new Date(a.data);

        return d.getMonth()+1==mesAtual &&
               d.getFullYear()==anoAtual;

    });

    document.getElementById("atendimentosMes").innerText =
    mesTotal.length;



    document.getElementById("totalCriancas").innerText =
    atendimentos.length;



    const responsaveis =
    [...new Set(atendimentos.map(a=>a.responsavel).filter(Boolean))];

    document.getElementById("totalResponsaveis").innerText =
    responsaveis.length;



    const localidades =
    [...new Set(atendimentos.map(a=>a.localidade).filter(Boolean))];

    document.getElementById("totalLocalidades").innerText =
    localidades.length;



    document.getElementById("tipoMaisUtilizado").innerText =
    obterTipoMaisUtilizado();



    document.getElementById("plantonistaDia").innerText =
    obterPlantonistaHoje();

}



/* ==========================================
   Tipo mais utilizado
========================================== */

function obterTipoMaisUtilizado(){

    const contador={};

    atendimentos.forEach(a=>{

        const tipo=a.tipo || "Não informado";

        contador[tipo]=(contador[tipo]||0)+1;

    });

    let maior=0;

    let nome="-";

    for(let t in contador){

        if(contador[t]>maior){

            maior=contador[t];

            nome=t;

        }

    }

    return nome;

}



/* ==========================================
   Plantonista
========================================== */

function obterPlantonistaHoje(){

    if(atendimentos.length==0)
        return "-";

    const ultimo=
    atendimentos[atendimentos.length-1];

    return ultimo.plantonista || "-";

}



/* ==========================================
   Usuário
========================================== */

function carregarUsuario(){

    const nome =
    localStorage.getItem("siga_nome") || "Administrador";

    const campo =
    document.getElementById("nomeUsuario");

    if(campo)
        campo.innerText = nome;

}



/* ==========================================
   Data Atual
========================================== */

function mostrarData(){

    const hoje = new Date();

    const texto =
    hoje.toLocaleDateString("pt-BR",{

        weekday:"long",

        day:"2-digit",

        month:"long",

        year:"numeric"

    });

    const campo =
    document.getElementById("dataAtual");

    if(campo)
        campo.innerText=texto;

}



/* ==========================================
   Últimos Atendimentos
========================================== */

function carregarTabela(){

    const tbody =
    document.getElementById("tabelaAtendimentos");

    if(!tbody)
        return;

    tbody.innerHTML="";

    atendimentos.slice().reverse().slice(0,10).forEach((a,i)=>{

        tbody.innerHTML +=`

        <tr>

        <td>${a.data || ""}</td>

        <td>${a.nome || ""}</td>

        <td>${a.responsavel || ""}</td>

        <td>${a.tipo || ""}</td>

        <td>${a.assunto || ""}</td>

        <td>${a.plantonista || ""}</td>

        <td>

            <button class="btn">Ver</button>

        </td>

        </tr>

        `;

    });

}



/* ==========================================
   GRÁFICO TIPO
========================================== */

function criarGraficoTipos(){

    const canvas =
    document.getElementById("graficoTipo");

    if(!canvas) return;

    const tipos={};

    atendimentos.forEach(a=>{

        const tipo=a.tipo || "Outro";

        tipos[tipo]=(tipos[tipo]||0)+1;

    });

    new Chart(canvas,{

        type:"doughnut",

        data:{

            labels:Object.keys(tipos),

            datasets:[{

                data:Object.values(tipos),

                backgroundColor:[

                    "#1565C0",

                    "#2E7D32",

                    "#EF6C00",

                    "#8E24AA"

                ]

            }]

        }

    });

}



/* ==========================================
   GRÁFICO LOCALIDADE
========================================== */

function criarGraficoLocalidades(){

    const canvas=
    document.getElementById("graficoLocalidade");

    if(!canvas) return;

    const locais={};

    atendimentos.forEach(a=>{

        const l=a.localidade || "Não informado";

        locais[l]=(locais[l]||0)+1;

    });

    new Chart(canvas,{

        type:"bar",

        data:{

            labels:Object.keys(locais),

            datasets:[{

                label:"Atendimentos",

                data:Object.values(locais),

                backgroundColor:"#1565C0"

            }]

        }

    });

}



/* ==========================================
   GRÁFICO ASSUNTOS
========================================== */

function criarGraficoAssuntos(){

    const canvas=
    document.getElementById("graficoAssunto");

    if(!canvas) return;

    const assuntos={};

    atendimentos.forEach(a=>{

        const ass=a.assunto || "Outro";

        assuntos[ass]=(assuntos[ass]||0)+1;

    });

    new Chart(canvas,{

        type:"pie",

        data:{

            labels:Object.keys(assuntos),

            datasets:[{

                data:Object.values(assuntos),

                backgroundColor:[

                    "#1565C0",

                    "#2E7D32",

                    "#EF6C00",

                    "#8E24AA",

                    "#C62828",

                    "#00897B"

                ]

            }]

        }

    });

}
