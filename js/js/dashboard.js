/* ==========================================================
   SIGACTPAR
   DASHBOARD
========================================================== */

function iniciarDashboard(){

    atualizarCards();

    carregarUltimosAtendimentos();

    carregarAgenda();

    carregarVeiculos();

    carregarAvisos();

}

/* ==========================================================
   CARDS
========================================================== */

function atualizarCards(){

    document.getElementById("totalAtendimentos").textContent =
        Banco.dados.atendimentos.length;

    document.getElementById("atendimentosHoje").textContent =
        atendimentosHoje();

    document.getElementById("totalProcessos").textContent =
        Banco.dados.processos.length;

    document.getElementById("totalPendencias").textContent =
        totalPendencias();

}

/* ==========================================================
   ÚLTIMOS ATENDIMENTOS
========================================================== */

function carregarUltimosAtendimentos(){

    const tbody =
    document.getElementById("ultimosAtendimentos");

    if(!tbody) return;

    tbody.innerHTML="";

    if(Banco.dados.atendimentos.length===0){

        tbody.innerHTML=`

            <tr>

                <td colspan="4">

                    Nenhum atendimento cadastrado.

                </td>

            </tr>

        `;

        return;

    }

    const lista =

    [...Banco.dados.atendimentos]

    .reverse()

    .slice(0,5);

    lista.forEach(item=>{

        tbody.innerHTML+=`

            <tr>

                <td>${formatarData(item.data)}</td>

                <td>${item.crianca}</td>

                <td>${item.responsavel}</td>

                <td>${item.status}</td>

            </tr>

        `;

    });

}

/* ==========================================================
   AGENDA
========================================================== */

function carregarAgenda(){

    const agenda =

    document.getElementById("agendaHoje");

    if(!agenda) return;

    agenda.innerHTML="";

    if(Banco.dados.agenda.length===0){

        agenda.innerHTML=`

            <div class="vazio">

                Nenhum compromisso hoje.

            </div>

        `;

        return;

    }

}

/* ==========================================================
   VEÍCULOS
========================================================== */

function carregarVeiculos(){

    const disponiveis=

    document.getElementById("veiculosDisponiveis");

    const manutencao=

    document.getElementById("veiculosManutencao");

    if(!disponiveis || !manutencao) return;

    let livres=0;

    let oficina=0;

    Banco.dados.veiculos.forEach(v=>{

        if(v.status==="Disponível"){

            livres++;

        }else{

            oficina++;

        }

    });

    disponiveis.textContent=livres;

    manutencao.textContent=oficina;

}

/* ==========================================================
   AVISOS
========================================================== */

function carregarAvisos(){

    const avisos=

    document.getElementById("avisosSistema");

    if(!avisos) return;

    avisos.innerHTML=`

        <div class="vazio">

            Nenhum aviso disponível.

        </div>

    `;

}
