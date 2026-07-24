/**
 * Função principal para processar o texto extraído do PDF e carregar no sistema
 */
function processarExtracaoPdf(texto) {

    console.log("========== 1. INICIANDO PROCESSAMENTO DO PDF ==========");

    if (!texto || typeof texto !== "string" || texto.trim() === "") {
        console.error("ERRO: O texto passado para a função está vazio ou inválido!");
        alert("Atenção: Nenhum texto legível foi encontrado neste PDF.");
        return;
    }

    // ==========================================
    // ETAPA 1: NORMALIZAÇÃO GERAL DO TEXTO
    // ==========================================
    let textoLimpo = texto
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{2,}/g, "\n");

    const linhas = textoLimpo
        .split("\n")
        .map(l => l.trim())
        .filter(l => l !== "");

    const dados = {
        dataAtendimento: "",
        nomeCrianca: "",
        dataNascimento: "",
        responsavel: "",
        endereco: "",
        telefone: "",
        contato: "",
        assunto: "",
        atendimento: ""
    };

    function normalizarTexto(str) {
        if (!str) return "";
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[,.-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    // ==========================================
    // ETAPA 2: MAPEAMENTO DE SINÔNIMOS E RÓTULOS
    // ==========================================
    const campos = {
        nomeCrianca: [
            "crianca",
            "crianca adolescente",
            "adolescente",
            "nome",
            "nome da crianca",
            "nome do adolescente"
        ],
        dataNascimento: [
            "data de nascimento",
            "nascimento",
            "dt nasc",
            "data nasc",
            "d n", 
            "dn"
        ],
        responsavel: [
            "responsavel",
            "responsavel legal",
            "genitora",
            "genitor",
            "pai",
            "mae"
        ],
        endereco: [
            "endereco",
            "logradouro",
            "residencia"
        ],
        telefone: [
            "telefone",
            "fone",
            "celular"
        ],
        contato: [
            "contato"
        ],
        assunto: [
            "assunto",
            "motivo",
            "demanda"
        ],
        atendimento: [
            "tipo de atendimento",
            "atendimento"
        ],
        dataAtendimento: [
            "data",
            "data do atendimento"
        ]
    };

    // ==========================================
    // ETAPA 3: VARREDURA FLEXÍVEL DE LINHAS
    // ==========================================
    linhas.forEach((linha, indice) => {
        const linhaNorm = normalizarTexto(linha);

        Object.keys(campos).forEach(campo => {
            if (dados[campo] !== "") return;

            campos[campo].forEach(nomeCampo => {
                if (dados[campo] !== "") return;

                if (linhaNorm.includes(nomeCampo)) {
                    let partes = linha.split(new RegExp(nomeCampo, "i"));
                    let valor = partes[1] ? partes[1].replace(/^[:\- ]+/, "").trim() : "";

                    if (!valor && linhas[indice + 1]) {
                        const prox = linhas[indice + 1];
                        if (!prox.toLowerCase().includes(":")) {
                            valor = prox.trim();
                        }
                    }

                    if (valor) {
                        dados[campo] = valor;
                    }
                }
            });
        });
    });

    // ==========================================
    // ETAPA 4: BUSCA INTELIGENTE DE DATAS (DD/MM/AAAA)
    // ==========================================
    const regexDatas = /\b(\d{2}\/\d{2}\/\d{4})\b/g;
    const todasDatas = textoLimpo.match(regexDatas);

    if (todasDatas && todasDatas.length > 0) {
        linhas.forEach((linha, idx) => {
            const lNorm = normalizarTexto(linha);
            if ((lNorm.includes("nascimento") || lNorm.includes("d n") || lNorm.includes("dn")) && !dados.dataNascimento) {
                const matchLinha = linha.match(regexDatas);
                if (matchLinha) {
                    dados.dataNascimento = matchLinha[0];
                } else if (linhas[idx + 1]) {
                    const matchProx = linhas[idx + 1].match(regexDatas);
                    if (matchProx) dados.dataNascimento = matchProx[0];
                }
            }
        });

        if (!dados.dataNascimento && todasDatas.length > 1) {
            dados.dataNascimento = todasDatas[1];
        }
        if (!dados.dataAtendimento) {
            dados.dataAtendimento = todasDatas[0];
        }
    }

    // ==========================================
    // ETAPA 5: BUSCA DE TELEFONE E CONTATO
    // ==========================================
    if (!dados.telefone) {
        const telMatch = textoLimpo.match(/(\(?\d{2}\)?\s?9?\d{4}\-?\d{4})/);
        if (telMatch) dados.telefone = telMatch[1];
    }

    if (!dados.contato) {
        dados.contato = dados.telefone;
    }

    // ==========================================
    // ETAPA 6: TRATAMENTO DO TIPO DE ATENDIMENTO
    // ==========================================
    const atendimentoTextoNorm = normalizarTexto(textoLimpo);
    if (!dados.atendimento) {
        if (atendimentoTextoNorm.includes("atendimento presencial") || atendimentoTextoNorm.includes("presencial")) {
            dados.atendimento = "Presencial";
        } else if (atendimentoTextoNorm.includes("atendimento telefonico") || atendimentoTextoNorm.includes("telefonico") || atendimentoTextoNorm.includes("telefone")) {
            dados.atendimento = "Telefônico";
        } else if (atendimentoTextoNorm.includes("atendimento online") || atendimentoTextoNorm.includes("on line") || atendimentoTextoNorm.includes("online")) {
            dados.atendimento = "Online";
        } else if (atendimentoTextoNorm.includes("contato")) {
            dados.atendimento = "Contato";
        } else if (atendimentoTextoNorm.includes("outro")) {
            const regexOutroAtend = /outro[:\s]+([^\n]+)/i;
            const matchOutro = textoLimpo.match(regexOutroAtend);
            dados.atendimento = matchOutro ? matchOutro[1].trim() : "Outro";
        }
    }

    // ==========================================
    // ETAPA 7: TRATAMENTO DO ASSUNTO
    // ==========================================
    const assuntoTextoNorm = normalizarTexto(textoLimpo);
    if (!dados.assunto) {
        if (assuntoTextoNorm.includes("suspeita de abuso")) {
            dados.assunto = "Suspeita de abuso";
        } else if (assuntoTextoNorm.includes("violencia fisica")) {
            dados.assunto = "Violência física";
        } else if (assuntoTextoNorm.includes("abandono de incapaz")) {
            dados.assunto = "Abandono de incapaz";
        } else if (assuntoTextoNorm.includes("outro")) {
            const regexOutroAssunto = /outro[:\s]+([^\n]+)/i;
            const matchAssuntoOutro = textoLimpo.match(regexOutroAssunto);
            dados.assunto = matchAssuntoOutro ? matchAssuntoOutro[1].trim() : "Outro";
        }
    }

    // ==========================================
    // ETAPA 8: FORMATADOR DE DATA PARA HTML (AAAA-MM-DD)
    // ==========================================
    function converterDataParaInput(dataStr) {
        if (!dataStr || !dataStr.includes("/")) return "";
        const partes = dataStr.split("/");
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
        return "";
    }

    console.log("========== 2. DADOS FINAIS EXTRAÍDOS ==========");
    console.table(dados);

    // ==========================================
    // ETAPA 9: PREENCHIMENTO DO FORMULÁRIO HTML
    // ==========================================
    if(document.getElementById("txtNome")) document.getElementById("txtNome").value = dados.nomeCrianca;
    if(document.getElementById("txtDataNascimento")) document.getElementById("txtDataNascimento").value = converterDataParaInput(dados.dataNascimento);
    if(document.getElementById("txtResponsavel")) document.getElementById("txtResponsavel").value = dados.responsavel;
    if(document.getElementById("txtEndereco")) document.getElementById("txtEndereco").value = dados.endereco;
    if(document.getElementById("txtTelefone")) document.getElementById("txtTelefone").value = dados.telefone;
    if(document.getElementById("txtContato")) document.getElementById("txtContato").value = dados.contato;
    if(document.getElementById("txtAssunto")) document.getElementById("txtAssunto").value = dados.assunto;

    const tipo = document.getElementById("cmbTipoAtendimento");
    if (tipo) tipo.value = dados.atendimento;

    const dataAtendInput = document.getElementById("txtData");
    if (dataAtendInput) dataAtendInput.value = converterDataParaInput(dados.dataAtendimento);

    // ==========================================
    // ETAPA 10: SALVAMENTO GLOBAL NO APP (LOCALSTORAGE)
    // ==========================================
    try {
        localStorage.setItem("dadosAtendimentoGlobal", JSON.stringify(dados));
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
    }

    alert(
`Documento analisado com sucesso!

Nome: ${dados.nomeCrianca || "-"}
Nascimento: ${dados.dataNascimento || "-"}
Responsável: ${dados.responsavel || "-"}
Endereço: ${dados.endereco || "-"}
Telefone: ${dados.telefone || "-"}
Contato: ${dados.contato || "-"}
Assunto: ${dados.assunto || "-"}
Atendimento: ${dados.atendimento || "-"}
`
    );
}

// ==========================================
// ETAPA 11: LEITOR AUTOMÁTICO DE PDF VIA PDF.JS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const inputFile = document.querySelector("input[type='file']");
    
    if (inputFile) {
        inputFile.addEventListener("change", async function(e) {
            const arquivo = e.target.files[0];
            if (!arquivo) return;

            try {
                const leitorArray = await arquivo.arrayBuffer();
                
                // Configuração do leitor nativo de PDF
                if (typeof pdfjsLib === "undefined") {
                    alert("A biblioteca PDF.js não foi encontrada no seu HTML. Certifique-se de incluí-la.");
                    return;
                }

                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const carregadorPdf = pdfjsLib.getDocument({ data: leitorArray });
                const pdfDoc = await carregadorPdf.promise;
                let textoCompleto = "";

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const pagina = await pdfDoc.getPage(i);
                    const conteudoTexto = await pagina.getTextContent();
                    const textoPagina = conteudoTexto.items.map(item => item.str).join(" ");
                    textoCompleto += textoPagina + "\n";
                }

                processarExtracaoPdf(textoCompleto);

            } catch (erro) {
                console.error("Erro ao ler o PDF:", erro);
                alert("Erro ao ler o arquivo PDF. Certifique-se de enviar um PDF válido.");
            }
        });
    }
});
