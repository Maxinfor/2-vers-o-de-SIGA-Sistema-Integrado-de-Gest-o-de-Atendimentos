function processarExtracaoPdf(texto) {

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

    // Função auxiliar para remover acentos, pontuações e transformar em minúsculas
    function normalizarTexto(str) {
        if (!str) return "";
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[,.-]/g, " ")          // Substitui vírgulas, pontos e traços por espaço
            .replace(/\s+/g, " ")            // Padroniza espaços
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
    // ETAPA 3: VARREDURA LINHA POR LINHA (CAMPOS TEXTUAIS)
    // ==========================================
    linhas.forEach((linha, indice) => {
        const linhaNorm = normalizarTexto(linha);

        Object.keys(campos).forEach(campo => {
            if (dados[campo] !== "") return;

            campos[campo].forEach(nomeCampo => {
                if (dados[campo] !== "") return;

                if (linhaNorm.startsWith(nomeCampo)) {
                    let valor = linha.substring(nomeCampo.length);
                    valor = valor.replace(/^[:\- ]+/, "").trim();

                    if (!valor && linhas[indice + 1]) {
                        const prox = linhas[indice + 1];
                        if (!prox.includes(":"))
                            valor = prox.trim();
                    }

                    dados[campo] = valor;
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
            if ((lNorm.includes("nascimento") || lNorm.includes("d n")) && !dados.dataNascimento) {
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
    // ETAPA 7: TRATAMENTO DO ASSUNTO (COM SUPORTE A "OUTRO")
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
    // ETAPA 8: FUNÇÃO AUXILIAR PARA FORMATAR DATA (AAAA-MM-DD)
    // ==========================================
    function converterDataParaInput(dataStr) {
        if (!dataStr || !dataStr.includes("/")) return "";
        const partes = dataStr.split("/");
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
        return "";
    }

    console.log("========== DADOS EXTRAÍDOS ==========");
    console.table(dados);

    // ==========================================
    // ETAPA 9: PREENCHIMENTO AUTOMÁTICO DO FORMULÁRIO HTML
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
    // Salva os dados em formato de texto (JSON) para que qualquer outra tela do app possa ler
    try {
        localStorage.setItem("dadosAtendimentoGlobal", JSON.stringify(dados));
        console.log("Dados salvos no armazenamento global do aplicativo com sucesso!");
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
    }

    // Alerta de confirmação
    alert(
`Documento analisado e carregado em todo o aplicativo com sucesso!

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
