document.addEventListener('DOMContentLoaded', () => {
    const dataAtual = document.getElementById('dataAtual');
    const data = new Date().toLocaleDateString('pt-BR');
    if(dataAtual) dataAtual.innerText = data;
});
