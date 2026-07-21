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
            weekday: "short",
            day: "2-digit",
            month: "short"
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
                <p style="color: var(--texto-secundario); margin-top: 10px;">Não foi possível carregar o conteúdo solicitado (${nomePagina}).</p>
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
        default:
            console.warn(`Nenhum inicializador encontrado para o módulo: ${modulo}`);
            break;
    }
}
