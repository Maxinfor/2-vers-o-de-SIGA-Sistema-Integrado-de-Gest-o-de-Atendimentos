// Exemplo de como fica dentro do js/relatorios.js se o seu sistema injetar via código:
function carregarPaginaRelatorios() {
    const conteudo = document.getElementById("conteudo");
    conteudo.innerHTML = `
        <div class="card">
            <h2>Relatórios do Sistema</h2>
            <p>Visualize e extraia dados consolidados.</p>
            
            <!-- SEU CÓDIGO HTML ENTRA AQUI -->
            <div class="secao-importacao-pdf" style="margin-top: 20px; padding: 20px; border: 1px dashed #ccc; border-radius: 8px;">
                <h3>Importar Dados de Atendimento via PDF</h3>
                <p>Selecione a ficha preenchida em PDF para o sistema carregar os campos automaticamente.</p>
                
                <input type="file" id="inputPdfImport" accept="application/pdf" style="display: none;">
                
                <button type="button" id="btnImportarPdfRelatorios" class="btn-primario">
                    <i class="fa-solid fa-file-pdf"></i> Importar PDF
                </button>
            </div>
        </div>
    `;
}
