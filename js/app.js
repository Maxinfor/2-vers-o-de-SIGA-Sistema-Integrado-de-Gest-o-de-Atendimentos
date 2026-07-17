document.addEventListener('DOMContentLoaded', () => {
    // Menu Mobile
    const btnMenu = document.getElementById('btnMenuMobile');
    const sidebar = document.getElementById('sidebar');

    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            sidebar.classList.toggle('ativo');
        });
    }

    // Fecha menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && btnMenu && !btnMenu.contains(e.target)) {
            sidebar.classList.remove('ativo');
        }
    });

    console.log("Sistema SIGACTPAR inicializado com sucesso.");
});
