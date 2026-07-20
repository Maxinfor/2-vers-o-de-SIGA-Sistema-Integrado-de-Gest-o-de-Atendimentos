/* ==========================================================
   SIGACTPAR
   DASHBOARD.JS - LÓGICA E GRÁFICOS DO PAINEL PRINCIPAL
========================================================== */

function iniciarDashboard() {
    carregarEstatisticasDashboard();
    carregarTabelaRecenteDashboard();
    renderizarGraficosDashboard();
    configurarAcoesRapidas();
}

/* ==========================================================
   ATUALIZAR MÉTRICAS / CARDS DO DASHBOARD
========================================================== */

function carregarEstatisticasDashboard() {
    // Exemplo puxando dados reais do Banco local se existirem, ou valores padrão
    const totalAtendimentosEl = document.getElementById("qtdAtendimentosHoje");
    const totalCriancasEl = document.getElementById("qtdCriancasAtendidas");
    const totalProcessosEl = document.getElementById("qtdProcessosAbertos");

    if (typeof totalAtendimentos === "function" && totalAtendimentosEl) {
        totalAtendimentosEl.textContent = totalAtendimentos();
    }

    if (typeof totalCriancas === "function" && totalCriancasEl) {
        totalCriancasEl.textContent = totalCriancas();
    }

    if (typeof totalProcessos === "function" && totalProcessosEl) {
        totalProcessosEl.textContent = totalProcessos();
    }
}

/* ==========================================================
   TABELA DE ATENDIMENTOS RECENTES
========================================================== */

function carregarTabelaRecenteDashboard() {
    const tbody = document.getElementById("tabelaAtendimentosRecentes");
    if (!tbody) return;

    // Verifica se o banco possui atendimentos cadastrados
    const atendimentos = (window.Banco && Banco.dados && Banco.dados.atendimentos) ? Banco.dados.atendimentos : [];

    if (atendimentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="vazio">Nenhum atendimento registrado recentemente.</td>
            </tr>
        `;
        return;
    }

    // Exibe os últimos 5 atendimentos
    const ultimos = atendimentos.slice(-5).reverse();

    tbody.innerHTML = ultimos.map(item => `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>${item.data || "20/07/2026"}</td>
            <td>${item.responsavel || "Responsável não informado"}</td>
            <td><span class="status ${obterClasseStatus(item.status)}">${item.status || "Em Andamento"}</span></td>
            <td>
                <div class="tabela-acoes">
                    <button class="btn-acao-tabela btn-visualizar" onclick="visualizarAtendimentoDashboard(${item.id})" title="Visualizar">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function obterClasseStatus(status) {
    if (!status) return "status-azul";
    const s = status.toLowerCase();
    if (s.includes("concluído") || s.includes("resolvido")) return "status-verde";
    if (s.includes("urgente") || s.includes("grave")) return "status-vermelho";
    if (s.includes("andamento")) return "status-laranja";
    return "status-azul";
}

function visualizarAtendimentoDashboard(id) {
    alert(`Visualizando detalhes do atendimento #${id}`);
    // Aqui você pode integrar com a abertura de um modal de visualização se desejar
}

/* ==========================================================
   GRÁFICOS (CHART.JS)
========================================================== */

function renderizarGraficosDashboard() {
    // Gráfico de Linha - Atendimentos Mensais
    const ctxLinha = document.getElementById("graficoAtendimentos");
    if (ctxLinha) {
        new Chart(ctxLinha.getContext("2d"), {
            type: "line",
            data: {
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
                datasets: [{
                    label: "Atendimentos",
                    data: [45, 52, 68, 74, 60, 85, 98],
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Gráfico de Rosca - Tipos de Ocorrências
    const ctxRosca = document.getElementById("graficoOcorrencias");
    if (ctxRosca) {
        new Chart(ctxRosca.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: ["Negligência", "Evasão Escolar", "Saúde", "Outros"],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ["#2563EB", "#10B981", "#F59E0B", "#7C3AED"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { boxWidth: 12, font: { size: 12 } }
                    }
                }
            }
        });
    }
}

/* ==========================================================
   AÇÕES RÁPIDAS / ATALHOS DO PAINEL
========================================================== */

function configurarAcoesRapidas() {
    // Exemplo de manipulação para botões de atalho caso queira disparar modais diretamente
    const btnNovoAtendimento = document.getElementById("btnNovoAtendimentoRapido");
    if (btnNovoAtendimento) {
        btnNovoAtendimento.addEventListener("click", () => {
            // Se houver função de abrir modal global, chame aqui
            if (typeof abrirModalAtendimento === "function") {
                abrirModalAtendimento();
            } else {
                alert("Redirecionando para novo atendimento...");
            }
        });
    }
}
