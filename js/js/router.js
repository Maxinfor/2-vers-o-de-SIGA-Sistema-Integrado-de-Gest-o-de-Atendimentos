/* ==========================================================
   SIGACTPAR - SISTEMA DE ROTAS (AJUSTADO)
========================================================== */

function carregarPagina(nomePagina) {
    const container = document.getElementById("conteudoDinamico");
    if (!container) return;

    const arquivo = `pages/${nomePagina}.html`;

    fetch(arquivo)
        .then(response => {
            if (!response.ok) throw new Error("Página não encontrada");
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            
            // Aguarda o HTML ser inserido no DOM para disparar os inicializadores
            setTimeout(() => {
                if (nomePagina === "dashboard" && typeof iniciarDashboard === "function") iniciarDashboard();
                if (nomePagina === "atendimentos" && typeof iniciarAtendimentos === "function") iniciarAtendimentos();
                if (nomePagina === "criancas" && typeof iniciarCriancas === "function") iniciarCriancas();
                if (nomePagina === "patrimonio" && typeof iniciarPatrimonio === "function") iniciarPatrimonio();
                if (nomePagina === "agenda" && typeof iniciarAgenda === "function") iniciarAgenda();
            }, 100);
        })
        .catch(error => {
            container.innerHTML = `<div class="pagina"><h2>Erro ao carregar a página</h2><p>Não foi possível carregar ${arquivo}.</p></div>`;
        });
}
