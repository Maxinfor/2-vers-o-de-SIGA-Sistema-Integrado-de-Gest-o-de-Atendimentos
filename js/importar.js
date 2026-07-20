/* ==========================================================
   SIGACTPAR - MÓDULO DE IMPORTAÇÃO E EXTRAÇÃO INTELIGENTE DE PDFS
========================================================== */

function iniciarRelatorios() {
    configurarEventosImportacao();
    atualizarIndicadoresRelatorios();
}

function configurarEventosImportacao() {
    const inputFiles = document.getElementById("inputPdfFiles");
    if (inputFiles) {
        inputFiles.onchange = async (e) => {
            const arquivos = e.target.files;
            if (arquivos.length > 0) {
                await processarArquivosPdf(arquivos);
            }
        };
    }
}

async function processarArquivosPdf(arquivos) {
    const tbody = document.getElementById("listaImportacaoPdf");
    if (!tbody) return;

    tbody.innerHTML = "";
    let resultadosHtml = "";
    let totalImportados = 0;

    for (let arquivo of arquivos) {
        try {
            const textoPdf = await extrairTextoDoPdf(arquivo);
            const dadosExtraidos = interpretarTextoDocumento(textoPdf);

            // Salva de forma automática nas tabelas do sistema
            salvarDadosImportadosNoSistema(dadosExtraidos);
            totalImportados++;

            resultadosHtml += `
                <tr>
                    <td><strong>${arquivo.name}</strong></td>
                    <td>${dadosExtraidos.crianca}</td>
                    <td><span class="badge azul">${dadosExtraidos.tipoAtendimento}</span> / ${dadosExtraidos.assunto}</td>
                    <td>${dadosExtraidos.dataAtendimento}</td>
                    <td><span class="badge verde"><i class="fa-solid fa-check"></i> Importado</span></td>
                </tr>
            `;
        } catch (erro) {
            console.error("Erro ao processar PDF:", erro);
            resultadosHtml += `
                <tr>
                    <td><strong>${arquivo.name}</strong></td>
                    <td colspan="3" style="color: var(--vermelho);">Erro ao extrair dados do documento.</td>
                    <td><span class="badge vermelho">Falha</span></td>
                </tr>
            `;
        }
    }

    tbody.innerHTML = resultadosHtml;

    // Atualiza contador de importados na tela
    const cardImportados = document.getElementById("cardTotalImportados");
    if (cardImportados) cardImportados.textContent = totalImportados;
    
    atualizarIndicadoresRelatorios();
}

async function extrairTextoDoPdf(arquivo) {
    const arrayBuffer = await arquivo.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textoCompleto = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const pagina = await pdf.getPage(i);
        const conteudo = await pagina.getTextContent();
        const textoPagina = conteudo.items.map(item => item.str).join(" ");
        textoCompleto += textoPagina + "\n";
    }

    return textoCompleto;
}

function interpretarTextoDocumento(texto) {
    const limpar = (str) => str ? str.trim() : "";

    const extrairCampo = (regex) => {
        const match = texto.match(regex);
        return match ? limpar(match[1]) : "";
    };

    // 1. Extração dos campos solicitados
    let crianca = extrairCampo(/(?:Criança|Criança\/Adolescente|Nome da Criança|Nome)\s*[:=]\s*([^,\n]+)/i);
    let nascimento = extrairCampo(/(?:D\.?N\.?|Nascimento|Data de Nasc\.?)\s*[:=]\s*(\d{2}\/\d{2}\/\d{4})/i);
    let responsavel = extrairCampo(/(?:Responsável|Responsável Legal|Pai\/Mãe)\s*[:=]\s*([^,\n]+)/i);
    let telefone = extrairCampo(/(?:Telefone|Tel|Contato|WhatsApp)\s*[:=]\s*([\(\)\d\s\-\.]+)/i);
    let endereco = extrairCampo(/(?:Endereço|End\.|Residência)\s*[:=]\s*([^,\n]+)/i);
    let dataAtendimento = extrairCampo(/(?:Data|Data do Atendimento)\s*[:=]\s*(\d{2}\/\d{2}\/\d{4})/i);

    // 2. Tipo de Atendimento (busca marcação [x] ou campo "Outro")
    let tipoAtendimento = "Demanda Espontânea";
    if (/\[\s*x\s*\]\s*Denúncia/i.test(texto) || /Denúncia/i.test(texto)) tipoAtendimento = "Denúncia";
    if (/\[\s*x\s*\]\s*Plantão/i.test(texto) || /Plantão/i.test(texto)) tipoAtendimento = "Plantão";
    let outroTipo = extrairCampo(/Tipo de Atendimento.*?[Oo]utro\s*[:=]\s*([^,\n]+)/i);
    if (outroTipo) tipoAtendimento = outroTipo;

    // 3. Assunto (busca marcação [x] ou campo "Outro")
    let assunto = "Acompanhamento Geral";
    if (/\[\s*x\s*\]\s*Escolar/i.test(texto) || /Frequência Escolar/i.test(texto)) assunto = "Frequência Escolar";
    if (/\[\s*x\s*\]\s*Saúde/i.test(texto) || /Saúde/i.test(texto)) assunto = "Saúde";
    if (/\[\s*x\s*\]\s*Abrigo/i.test(texto) || /Medida protetiva/i.test(texto)) assunto = "Medida Protetiva";
    let outroAssunto = extrairCampo(/[Aa]ssunto.*?[Oo]utro\s*[:=]\s*([^,\n]+)/i);
    if (outroAssunto) assunto = outroAssunto;

    return {
        crianca: crianca || "Não informado",
        nascimento: nascimento || "01/01/2015",
        responsavel: responsavel || "Não informado",
        telefone: telefone || "(61) 90000-0000",
        endereco: endereco || "Paranoá - DF",
        tipoAtendimento: tipoAtendimento,
        assunto: assunto,
        dataAtendimento: dataAtendimento || new Date().toLocaleDateString("pt-BR")
    };
}

function salvarDadosImportadosNoSistema(dados) {
    if (!Banco || !Banco.dados) return;

    // Salva o Responsável
    inserirRegistro("responsaveis", {
        id: gerarId("responsavel"),
        nome: dados.responsavel,
        cpf: "000.000.000-00",
        telefone: dados.telefone,
        endereco: dados.endereco,
        observacoes: "Importado via PDF"
    });

    // Converte a data de nascimento de DD/MM/AAAA para formato aceito no input date (AAAA-MM-DD)
    let partesData = dados.nascimento.split("/");
    let nascIso = partesData.length === 3 ? `${partesData[2]}-${partesData[1]}-${partesData[0]}` : "2015-01-01";

    // Salva a Criança/Adolescente
    inserirRegistro("criancas", {
        id: gerarId("crianca"),
        nome: dados.crianca,
        nascimento: nascIso,
        cpf: "",
        escola: "Escola do Paranoá",
        responsavel: dados.responsavel,
        observacoes: "Importado via PDF"
    });

    // Salva o Atendimento
    inserirRegistro("atendimentos", {
        id: gerarId("atendimentos"),
        tipo: dados.tipoAtendimento,
        crianca: dados.crianca,
        responsavel: dados.responsavel,
        assunto: dados.assunto,
        data: dados.dataAtendimento,
        status: "Em Andamento"
    });
}

function atualizarIndicadoresRelatorios() {
    if (!Banco || !Banco.dados) return;
    const totalGeral = (Banco.dados.atendimentos?.length || 0) + 
                       (Banco.dados.criancas?.length || 0) + 
                       (Banco.dados.responsaveis?.length || 0);

    const cardTotal = document.getElementById("cardTotalRelatorio");
    if (cardTotal) cardTotal.textContent = totalGeral;
}
