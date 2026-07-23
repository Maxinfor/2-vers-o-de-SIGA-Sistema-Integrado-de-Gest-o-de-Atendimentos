document.addEventListener("DOMContentLoaded", () => {
    // Se o seu sistema chama uma função específica para carregar a página de relatórios:
    carregarPaginaRelatorios();
});

function carregarPaginaRelatorios() {
    const conteudo = document.getElementById("conteudo");
    if (!conteudo) return;

    // Injeta o HTML estruturado corretamente sem quebrar o JavaScript
    conteudo.innerHTML = `
        <div class="pagina">
            <div class="titulo-pagina">
                <h2>Relatórios Estatísticos</h2>
                <small>Geração de relatórios gerenciais das ocorrências e atendimentos.</small>
            </div>
            
            <div class="painel" style="padding: 30px; text-align: center;"> 
                <i class="fa-solid fa-chart-column" style="font-size: 48px; color: var(--azul); margin-bottom: 15px;"></i>
                <h3>Módulo de Relatórios Integrados</h3>
                <p style="color: var(--texto-secundario); margin-top: 10px; margin-bottom: 25px;">Utilize os filtros globais para exportar dados estatísticos consolidados do Conselho Tutelar ou importe um PDF preenchido.</p>
                
                <div class="secao-importacao-pdf" style="margin-top: 20px; padding: 20px; border: 1px dashed var(--borda, #ccc); border-radius: 8px; background: var(--fundo-card, #f9f9f9);">
                    <h4 style="margin-bottom: 8px;">Importar Ficha de Atendimento via PDF</h4>
                    <p style="font-size: 14px; color: var(--texto-secundario); margin-bottom: 15px;">Selecione o PDF preenchido para o sistema extrair e carregar os dados automaticamente.</p>
                    
                    <input type="file" id="inputPdfImport" accept="application/pdf" style="display: none;">
                    
                    <button type="button" id="btnImportarPdfRelatorios" class="btn-primario" style="padding: 10px 20px; cursor: pointer;">
                        <i class="fa-solid fa-file-pdf"></i> Importar PDF
                    </button>
                </div>
            </div>
        </div>
    `;

    // Inicializa os eventos do botão após o HTML ser injetado na tela
    inicializarLeitorPdfRelatorios();
}

function inicializarLeitorPdfRelatorios() {
    const btnImportar = document.getElementById("btnImportarPdfRelatorios");
    const inputFile = document.getElementById("inputPdfImport");

    if (!btnImportar || !inputFile) return;

    btnImportar.onclick = () => {
        inputFile.click();
    };

    inputFile.onchange = async (event) => {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        try {
            if (typeof pdfjsLib === 'undefined') {
                alert("A biblioteca PDF.js não foi encontrada no index.html.");
                return;
            }

            const arrayBuffer = await arquivo.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            
            let textoPdf = "";

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const pagina = await pdfDoc.getPage(i);
                const conteudo = await pagina.getTextContent();
                const textosPagina = conteudo.items.map(item => item.str);
                textoPdf += textosPagina.join(" ") + "\n";
            }

            processarExtracaoPdf(textoPdf);

        } catch (erro) {
            console.error("Erro ao processar o PDF:", erro);
            alert("Erro ao ler o arquivo PDF.");
        } finally {
            inputFile.value = "";
        }
    };
}

function processarExtracaoPdf(texto) {
    const matchData = texto.match(/Data[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    const dataAtendimento = matchData ? matchData[1] : "";

    const matchCrianca = texto.match(/(?:Criança|Adolescente|Nome)[:\s]*([A-Za-zÀ-ú\s]+?)(?=(Data|Nascimento|Responsável|Endereço|Contato|$))/i);
    const nomeCrianca = matchCrianca ? matchCrianca[1].trim() : "";

    const matchNasc = texto.match(/(?:Nascimento|Dt\.?\s*Nasc\.?)[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    const dataNascimento = matchNasc ? matchNasc[1] : "";

    const matchResp = texto.match(/Responsável[:\s]*([A-Za-zÀ-ú\s]+?)(?=(Endereço|Contato|Telefone|$))/i);
    const responsavel = matchResp ? matchResp[1].trim() : "";

    const matchEnd = texto.match(/Endereço[:\s]*([A-Za-zÀ-ú0-9,\.\-\s]+?)(?=(Contato|Telefone|Responsável|$))/i);
    const endereco = matchEnd ? matchEnd[1].trim() : "";

    const matchContato = texto.match(/Contato[:\s]*([\d\(\)\-\s]+)/i);
    const contato = matchContato ? matchContato[1].trim() : "";

    const dadosFormulario = {
        dataAtendimento,
        nomeCrianca,
        dataNascimento,
        responsavel,
        endereco,
        contato
    };

    console.log("=== DADOS EXTRAÍDOS DO PDF ===", dadosFormulario);
    alert("PDF lido com sucesso! Abra o console (F12) para ver os dados.");
}
