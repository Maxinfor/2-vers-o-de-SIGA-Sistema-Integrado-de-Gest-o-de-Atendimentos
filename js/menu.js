/* ==========================================================
   SIGACTPAR
   MENU / NAVEGAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    iniciarSistema();

});

function iniciarSistema(){

    iniciarBanco();

    carregarPagina("dashboard");

    configurarMenu();

    atualizarData();

}

/* ==========================================================
   MENU
========================================================== */

function configurarMenu(){

    const links = document.querySelectorAll(".menu a");

    links.forEach(link=>{

        link.addEventListener("click",function(e){

            e.preventDefault();

            const pagina=this.dataset.page;

            if(!pagina) return;

            carregarPagina(pagina);

            ativarMenu(this);

        });

    });

}

/* ==========================================================
   MENU ATIVO
========================================================== */

function ativarMenu(link){

    document.querySelectorAll(".menu li")
    .forEach(li=>li.classList.remove("ativo"));

    link.parentElement.classList.add("ativo");

}

/* ==========================================================
   CARREGA PÁGINAS
========================================================== */

async function carregarPagina(nome){

    try{

        const resposta = await fetch(`pages/${nome}.html`);

        const html = await resposta.text();

        document.getElementById("conteudo").innerHTML=html;

        document.getElementById("tituloPagina").innerText=

            nome.charAt(0).toUpperCase()+nome.slice(1);

        executarModulo(nome);

    }

    catch{

        document.getElementById("conteudo").innerHTML=

        `
        <div style="padding:40px;text-align:center">

            <h2>Página não encontrada</h2>

        </div>
        `;

    }

}

/* ==========================================================
   CARREGA JS DO MÓDULO
========================================================== */

function executarModulo(modulo){

    switch(modulo){

        case "dashboard":

            if(typeof iniciarDashboard==="function"){

                iniciarDashboard();

            }

        break;

    }

}

/* ==========================================================
   DATA
========================================================== */

function atualizarData(){

    const hoje=new Date();

    const opcoes={

        weekday:"long",

        day:"2-digit",

        month:"long",

        year:"numeric"

    };

    const data=hoje.toLocaleDateString("pt-BR",opcoes);

    document.querySelectorAll("#dataAtual")

    .forEach(el=>el.innerHTML=data);

}
