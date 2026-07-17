// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuração da Sidebar Mobile
    const btnMenu = document.getElementById('btnMenuMobile');
    const sidebar = document.getElementById('sidebar');

    if (btnMenu && sidebar) {
        // Alterna o menu ao clicar no hambúrguer
        btnMenu.addEventListener('click', () => {
            sidebar.classList.toggle('ativo');
        });

        // Fecha o menu ao clicar fora dele (em telas mobile)
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !btnMenu.contains(e.target)) {
                sidebar.classList.remove('ativo');
            }
        });
    }

    // 2. Exibição da Data Atual no Perfil
    const dataDisplay = document.getElementById('dataAtual');
    if (dataDisplay) {
        const hoje = new Date();
        dataDisplay.innerText = hoje.toLocaleDateString('pt-BR');
    }

    // 3. Controle de Navegação Simples (Troca de título da página)
    const linksMenu = document.querySelectorAll('.menu a');
    const tituloPagina = document.getElementById('tituloPagina');

    linksMenu.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove classe ativo de todos
            linksMenu.forEach(l => l.parentElement.classList.remove('ativo'));
            // Adiciona no clicado
            link.parentElement.classList.add('ativo');
            
            // Atualiza o título do cabeçalho
            if (tituloPagina) {
                tituloPagina.innerText = link.querySelector('span').innerText;
            }
        });
    });
});
