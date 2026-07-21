/* ==========================================================
   SIGACTPAR
   SISTEMA DE NAVEGAÇÃO E GERENCIAMENTO DE ROTAS (MENU)
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    configurarMenuNavegacao();
    carregarPaginaInicial();
});

/* ==========================================================
   CONFIGURAR EVENTOS DO MENU
========================================================== */

function configurarMenuNavegacao() {
    const linksMenu = document.querySelectorAll(".menu a[data-page]");

    linksMenu.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const pagina = link.getAttribute("data-page");
            
            // Remove a classe ativo de todos os links e adiciona no clicado
            linksMenu.forEach(l => l.parentElement.classList.remove("ativo"));
            link.parentElement.classList.add("ativo");

            carregarPagina(pagina);

            // Em telas menores, fecha o menu ao clicar em uma opção
            const sidebar = document.getElementById("sidebar");
            if (sidebar && window.innerWidth <= 768) {
                sidebar.classList.remove("ativo");
            }
        });
    });

    // Botão de alternar menu mobile (hambúrguer)
    const btnMenu = document.getElementById("btnMenu");
    const sidebar = document.getElementById("sidebar");
    if (btnMenu && sidebar) {
        btnMenu.addEventListener("click", () => {
            sidebar.classList.toggle("ativo");
        });
    }

    // Atualiza a data atual no perfil da sidebar
    const elementoData = document.getElementById("dataAtual");
    if (elementoData) {
        const hoje = new Date();
        elementoData.textContent = hoje.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }
}

/* ==========================================================
   CARREGAR PÁGINA INICIAL (DASHBOARD)
========================================================== */

function carregarPaginaInicial() {
    const hash = window.location.hash.replace("#", "");
    const paginaInicial = hash || "dashboard";
    carregarPagina(paginaInicial);
}

/* ==========================================================
   FUNÇÃO DE CARREGAMENTO DINÂMICO DE PÁGINAS
========================================================== */

async function carregarPagina(nomePagina) {
    const conteudoMain = document.getElementById("conteudo");
    const tituloPagina = document.getElementById("tituloPagina");
    const loading = document.getElementById("loading");

    if (!conteudoMain) return;

    // Mapeamento de títulos amigáveis para o Header
    const titulos = {
        dashboard: "Dashboard",
        atendimentos: "Atendimentos",
        criancas: "Crianças e Adolescentes",
        responsaveis: "Responsáveis Legais",
        processos: "Processos e Procedimentos",
        agenda: "Agenda de Compromissos",
        relatorios: "Relatórios do Sistema",
        veiculos: "Controle de Veículos",
        patrimonio: "Controle de Patrimônio"
    };

    if (tituloPagina) {
        tituloPagina.textContent = titulos[nomePagina] || "SIGACTPAR";
    }

    // Exibe o loading
    if (loading) loading.classList.remove("oculto");

    try {
        const resposta = await fetch(`pages/${nomePagina}.html`);

        if (!resposta.ok) {
            throw new Error(`Erro ao carregar a página: ${resposta.status}`);
        }

        const html = await resposta.text();
        conteudoMain.innerHTML = html;

        // Atualiza a URL sem recarregar a página
        window.location.hash = nomePagina;

        // Dispara a função de inicialização específica de cada módulo
        executarInicializadorModulo(nomePagina);

    } catch (erro) {
        console.error("Erro de navegação:", erro);
        conteudoMain.innerHTML = `
            <div class="painel" style="text-align: center; padding: 40px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: var(--vermelho); margin-bottom: 15px;"></i>
                <h2>Página não encontrada</h2>
                <p style="color: var(--texto-secundario); margin-top: 10px;">Não foi possível carregar o conteúdo solicitado (${nomePagina}). Verifique se o arquivo correspondente existe na pasta pages/.</p>
            </div>
        `;
    } finally {
        // Oculta o loading
        if (loading) loading.classList.add("oculto");
    }
}

/* ==========================================================
   EXECUTAR INICIALIZADOR DE CADA MÓDULO
========================================================== */

function executarInicializadorModulo(modulo) {
    switch (modulo) {
        case "dashboard":
            if (typeof iniciarDashboard === "function") iniciarDashboard();
            break;
        case "atendimentos":
            if (typeof iniciarAtendimentos === "function") iniciarAtendimentos();
            break;
        case "criancas":
            if (typeof iniciarCriancas === "function") iniciarCriancas();
            break;
        case "responsaveis":
            if (typeof iniciarResponsaveis === "function") iniciarResponsaveis();
            break;
        case "processos":
            if (typeof iniciarProcessos === "function") iniciarProcessos();
            break;
        case "agenda":
            if (typeof iniciarAgenda === "function") iniciarAgenda();
            break;
        case "relatorios":
            if (typeof iniciarRelatorios === "function") iniciarRelatorios();
            break;
        case "veiculos":
            if (typeof iniciarVeiculos === "function") iniciarVeiculos();
            break;
        case "patrimonio":
            if (typeof iniciarPatrimonio === "function") iniciarPatrimonio();
            break;
        default:
            console.warn(`Nenhum inicializador encontrado para o módulo: ${modulo}`);
            break;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnMenu = document.getElementById("btnMenu");
    const sidebar = document.getElementById("sidebar");
    const linksMenu = document.querySelectorAll(".menu a");

    // Alternar abertura do menu no botão hambúrguer
    if (btnMenu && sidebar) {
        btnMenu.onclick = () => {
            sidebar.classList.toggle("ativo");
        };
    }

    // FECHAR O MENU AUTOMATICAMENTE AO CLICAR EM QUALQUER LINK NO CELULAR
    linksMenu.forEach(link => {
        link.onclick = () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove("ativo");
            }
        };
    });
});
/* ==========================================================
   ATUALIZADOR GLOBAL DE BOTÕES
========================================================== */
document.addEventListener("click", function(e) {
    // Procura se o elemento clicado é um botão de atualizar ou possui o ID/classe correspondente
    const btn = e.target.closest("#btnAtualizar, .btn-atualizar, [id^='btnAtualizar']");
    if (!btn) return;

    // Descobre qual página está ativa no momento pelo menu
    const linkAtivo = document.querySelector(".menu li.ativo a, .sidebar .menu li.ativo a");
    const paginaAtual = linkAtivo ? linkAtivo.getAttribute("data-page") : "dashboard";

    // Executa a função de atualização específica de cada módulo
    switch(paginaAtual) {
        case "dashboard":
            if (typeof iniciarDashboard === "function") iniciarDashboard();
            break;
        case "atendimentos":
            const pesquisaAtend = document.getElementById("pesquisaAtendimento");
            if (pesquisaAtend) pesquisaAtend.value = "";
            if (typeof atualizarTabelaAtendimentos === "function") atualizarTabelaAtendimentos();
            if (typeof calcularIndicadoresAtendimentos === "function") calcularIndicadoresAtendimentos();
            break;
        case "criancas":
            if (typeof atualizarTabelaCriancas === "function") atualizarTabelaCriancas();
            break;
        case "responsaveis":
            if (typeof atualizarTabelaResponsaveis === "function") atualizarTabelaResponsaveis();
            break;
        case "processos":
            if (typeof atualizarTabelaProcessos === "function") atualizarTabelaProcessos();
            break;
        case "agenda":
            if (typeof iniciarAgenda === "function") iniciarAgenda();
            break;
        case "relatorios":
            if (typeof gerarRelatorios === "function") gerarRelatorios();
            break;
        case "veiculos":
            if (typeof atualizarTabelaVeiculos === "function") atualizarTabelaVeiculos();
            break;
        case "patrimonio":
            if (typeof atualizarTabelaPatrimonio === "function") atualizarTabelaPatrimonio();
            break;
        default:
            // Fallback geral: reinicializa o banco e recarrega a página atual
            if (typeof Banco !== "undefined" && Banco.inicializar) Banco.inicializar();
            location.reload();
            break;
    }

    // Feedback visual opcional (dispara um pequeno efeito no botão)
    const icone = btn.querySelector("i");
    if (icone) {
        icone.classList.add("fa-spin");
        setTimeout(() => icone.classList.remove("fa-spin"), 600);
    }
});

