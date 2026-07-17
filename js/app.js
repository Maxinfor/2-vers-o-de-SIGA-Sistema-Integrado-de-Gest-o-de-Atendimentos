// Função para carregar a data atual no menu lateral
function carregarData() {
    const elementoData = document.getElementById('dataAtual');
    const data = new Date();
    
    // Configura o formato da data (ex: 17 de julho de 2026)
    const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
    const dataFormatada = data.toLocaleDateString('pt-BR', opcoes);
    
    // Atualiza o texto na sidebar
    if (elementoData) {
        elementoData.innerText = dataFormatada;
    }
}

// Executa a função assim que a página carregar
document.addEventListener('DOMContentLoaded', carregarData);
