// Carrega a biblioteca PDF.js dinamicamente se ela já não existir na página
function carregarBibliotecaPdfJs() {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) {
            resolve(window.pdfjsLib);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Escuta a seleção do arquivo em qualquer momento (mesmo se o HTML carregar depois)
document.addEventListener("change", async (event) => {
    if (event.target && event.target.id === "inputPdfImport") {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        console.log("Iniciando leitura do arquivo:", arquivo.name);

        try {
            // Garante que o motor do PDF está pronto
            const pdfjsLib = await carregarBibliotecaPdfJs();

            const arrayBuffer = await arquivo.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            
            let textoPdf = "";

            // Varre todas as páginas do PDF recolhendo os textos
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const pagina = await pdfDoc.getPage(i);
                const conteudo = await pagina.getTextContent();
                const textosPagina = conteudo.items.map(item => item.str);
                textoPdf += textosPagina.join(" ") + "\n";
            }

            processarExtracaoPdf(textoPdf);

        } catch (erro) {
            console.error("Erro ao processar o PDF:", erro);
            alert("Não foi possível ler este arquivo PDF. Verifique se o arquivo está íntegro.");
        } finally {
            // Limpa o input para permitir nova seleção se precisar
            event.target.value = "";
        }
    }
});

function processarExtracaoPdf(texto) {
    // Expressões regulares inteligentes para capturar os dados do documento
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

    console.log("=== DADOS EXTRAÍDOS COM SUCESSO ===", dadosFormulario);
    
    // Alerta informativo com os dados encontrados para validação imediata
    alert(`PDF Lido com Sucesso!\n\nCriança: ${nomeCrianca || 'Não identificado'}\nResponsável: ${responsavel || 'Não identificado'}\nData: ${dataAtendimento || 'Não identificada'}\n\n(Abra o F12 > Console para ver o objeto completo)`);
}
