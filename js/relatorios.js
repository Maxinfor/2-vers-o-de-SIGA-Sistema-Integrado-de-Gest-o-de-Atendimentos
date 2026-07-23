document.addEventListener("DOMContentLoaded", () => {
    inicializarLeitorPdfRelatorios();
});

function inicializarLeitorPdfRelatorios() {
    // Usamos um pequeno atraso ou verificação para garantir que o DOM dinâmico carregou os elementos
    setTimeout(() => {
        const btnImportar = document.getElementById("btnImportarPdfRelatorios");
        const inputFile = document.getElementById("inputPdfImport");

        if (!btnImportar || !inputFile) return;

        // Evita duplicação de eventos caso a função seja chamada mais de uma vez
        btnImportar.onclick = () => {
            inputFile.click();
        };

        inputFile.onchange = async (event) => {
            const arquivo = event.target.files[0];
            if (!arquivo) return;

            try {
                // Valida se o PDF.js está carregado no index.html
                if (typeof pdfjsLib === 'undefined') {
                    alert("A biblioteca PDF.js não foi encontrada no index.html.");
                    return;
                }

                const arrayBuffer = await arquivo.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdfDoc = await loadingTask.promise;
                
                let textoPdf = "";

                // Varrer todas as páginas do documento PDF
                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const pagina = await pdfDoc.getPage(i);
                    const conteudo = await pagina.getTextContent();
                    const textosPagina = conteudo.items.map(item => item.str);
                    textoPdf += textosPagina.join(" ") + "\n";
                }

                // Processa a extração dos dados mapeados
                processarExtracaoPdf(textoPdf);

            } catch (erro) {
                console.error("Erro ao processar o PDF:", erro);
                alert("Erro ao ler o arquivo PDF. Certifique-se de que é um documento válido.");
            } finally {
                // Limpa o input para permitir reenvio do mesmo arquivo se necessário
                inputFile.value = "";
            }
        };
    }, 300);
}

function processarExtracaoPdf(texto) {
    // 1. Data do atendimento
    const matchData = texto.match(/Data[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    const dataAtendimento = matchData ? matchData[1] : "";

    // 2. Criança / Adolescente (Busca o nome após o campo)
    const matchCrianca = texto.match(/(?:Criança|Adolescente|Nome)[:\s]*([A-Za-zÀ-ú\s]+?)(?=(Data|Nascimento|Responsável|Endereço|Contato|$))/i);
    const nomeCrianca = matchCrianca ? matchCrianca[1].trim() : "";

    // 3. Data de Nascimento (dia/mês/ano)
    const matchNasc = texto.match(/(?:Nascimento|Dt\.?\s*Nasc\.?)[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    const dataNascimento = matchNasc ? matchNasc[1] : "";

    // 4. Responsável
    const matchResp = texto.match(/Responsável[:\s]*([A-Za-zÀ-ú\s]+?)(?=(Endereço|Contato|Telefone|$))/i);
    const responsavel = matchResp ? matchResp[1].trim() : "";

    // 5. Endereço
    const matchEnd = texto.match(/Endereço[:\s]*([A-Za-zÀ-ú0-9,\.\-\s]+?)(?=(Contato|Telefone|Responsável|$))/i);
    const endereco = matchEnd ? matchEnd[1].trim() : "";

    // 6. Contato
    const matchContato = texto.match(/Contato[:\s]*([\d\(\)\-\s]+)/i);
    const contato = matchContato ? matchContato[1].trim() : "";

    // 7. Tipos de Atendimento (Verifica marcações de X)
    const presencial = /presencial[^\w]*[xX]/i.test(texto) || /\([xX]\)\s*presencial/i.test(texto);
    const telefone = /(telefone|telefônico)[^\w]*[xX]/i.test(texto) || /\([xX]\)\s*(telefone|telefônico)/i.test(texto);
    const outroAtendimento = /outro[^\w]*[xX]/i.test(texto) || /\([xX]\)\s*outro/i.test(texto);

    // 8. Motivos da Ocorrência (Verifica marcações de X)
    const suspeitaAbuso = /suspeita de abuso[^\w]*[xX]/i.test(texto) || /\([xX]\)\s*suspeita de abuso/i.test(texto);
    const violenciaFisica = /violência física[^\w]*[xX]/i.test(texto) || /\([xX]\)\s*violência física/i.test(texto);
    const abandonoIncapaz = /abandono de incapaz[^\w]*[xX]/i.test(texto) || /\([xX]\)\s*abandono de incapaz/i.test(texto);
    const outroMotivo = /outro motivo[^\w]*[xX]/i.test(texto) || /\([xX]\)\s*outro motivo/i.test(texto);

    // Consolidando os dados extraídos
    const dadosFormulario = {
        dataAtendimento,
        nomeCrianca,
        dataNascimento,
        responsavel,
        endereco,
        contato,
        tiposAtendimento: { presencial, telefone, outroAtendimento },
        motivos: { suspeitaAbuso, violenciaFisica, abandonoIncapaz, outroMotivo }
    };

    console.log("=== DADOS EXTRAÍDOS DO PDF ===", dadosFormulario);

    // Notifica o usuário e exibe no console para validação
    alert("PDF lido com sucesso! Os dados foram processados. Abra o console do navegador (F12) para inspecionar os valores extraídos.");
}
