document.addEventListener("DOMContentLoaded", () => {
    observarCarregamentoRelatorios();
});

// Como o sistema carrega as páginas dinamicamente via menu, usamos um observador ou verificador
function observarCarregamentoRelatorios() {
    // Tenta configurar imediatamente caso já esteja na tela
    configurarLeitorPdf();

    // Cria um observador para caso o usuário navegue para a aba de relatórios pelo menu
    const observer = new MutationObserver(() => {
        const btnImportar = document.getElementById("btnImportarPdfRelatorios");
        if (btnImportar && !btnImportar.dataset.configurado) {
            configurarLeitorPdf();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function configurarLeitorPdf() {
    const btnImportar = document.getElementById("btnImportarPdfRelatorios");
    const inputFile = document.getElementById("inputPdfImport");

    if (!btnImportar || !inputFile) return;

    // Marca para evitar duplicidade de eventos
    btnImportar.dataset.configurado = "true";

    btnImportar.onclick = (e) => {
        e.preventDefault();
        inputFile.click();
    };

    inputFile.onchange = async (event) => {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        try {
            if (typeof pdfjsLib === 'undefined') {
                alert("A biblioteca PDF.js não foi encontrada no index.html. Verifique se adicionou os scripts do PDF.js.");
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
            alert("Erro ao ler o arquivo PDF. Certifique-se de que é um PDF válido.");
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
    alert("PDF lido com sucesso! Abra o console do navegador (F12) para visualizar os dados extraídos.");
}
