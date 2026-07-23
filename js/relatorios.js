// Delegação global de eventos: Funciona mesmo se a página for carregada dinamicamente via menu
document.addEventListener("click", async (event) => {
    // 1. Quando clicar no botão "Importar PDF"
    if (event.target.closest("#btnImportarPdfRelatorios")) {
        event.preventDefault();
        const inputFile = document.getElementById("inputPdfImport");
        if (inputFile) {
            inputFile.click();
        } else {
            console.error("Input de arquivo #inputPdfImport não foi encontrado no HTML.");
        }
    }
});

// 2. Quando um arquivo PDF for selecionado no input
document.addEventListener("change", async (event) => {
    if (event.target && event.target.id === "inputPdfImport") {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        try {
            if (typeof pdfjsLib === 'undefined') {
                alert("A biblioteca PDF.js não foi encontrada no index.html. Verifique a instalação.");
                return;
            }

            const arrayBuffer = await arquivo.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            
            let textoPdf = "";

            // Varre todas as páginas do PDF extraindo os textos
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const pagina = await pdfDoc.getPage(i);
                const conteudo = await pagina.getTextContent();
                const textosPagina = conteudo.items.map(item => item.str);
                textoPdf += textosPagina.join(" ") + "\n";
            }

            processarExtracaoPdf(textoPdf);

        } catch (erro) {
            console.error("Erro ao processar o PDF:", erro);
            alert("Erro ao ler o arquivo PDF. Certifique-se de que é um documento válido.");
        } finally {
            // Limpa o input para permitir importar o mesmo arquivo novamente se precisar
            event.target.value = "";
        }
    }
});

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
    alert("PDF lido com sucesso! Abra o console do navegador (F12) para visualizar os dados extraídos.");
}
