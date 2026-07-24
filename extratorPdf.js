/* ==========================================================
   SIGACTPAR - EXTRATOR DE PDF (ADAPTADO PARA SEU FORMULÁRIO)
========================================================== */

class ExtratorPDF {
    constructor() {
        this.dados = {};
    }

    // ==========================================
    // NORMALIZAÇÃO DE TEXTO
    // ==========================================
    normalizar(texto) {
        if (!texto) return "";
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\r/g, "")
            .replace(/[ \t]+/g, " ")
            .replace(/\n+/g, "\n")
            .trim()
            .toLowerCase();
    }

    // ==========================================
    // EXTRAIR CAMPO POR RÓTULO
    // ==========================================
    extrairCampo(texto, rotulos) {
        for (const rotulo of rotulos) {
            const padroes = [
                new RegExp(`${rotulo}\\s*[:\\-]?\\s*([^\\n]+)`, "i"),
                new RegExp(`${rotulo}\\s*([^\\n]+)`, "i"),
                new RegExp(`([^\\n]+)\\s*[-:]\\s*${rotulo}`, "i")
            ];
            
            for (const regex of padroes) {
                const match = texto.match(regex);
                if (match && match[1]) {
                    const valor = match[1].trim();
                    if (valor && valor.length > 1 && !valor.includes(':')) {
                        return valor;
                    }
                }
            }
        }
        return "";
    }

    // ==========================================
    // LOCALIZAR DATAS
    // ==========================================
    localizarDatas(texto) {
        return texto.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g) || [];
    }

    // ==========================================
    // LOCALIZAR TELEFONE
    // ==========================================
    localizarTelefone(texto) {
        const padroes = [
            /\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/g,
            /\(?\d{2}\)?\s?\d{4}[-\s]?\d{4}/g,
            /\d{2}\s?9?\d{4}\s?\d{4}/g
        ];
        
        for (const padrao of padroes) {
            const match = texto.match(padrao);
            if (match && match[0]) {
                return match[0].trim();
            }
        }
        return "";
    }

    // ==========================================
    // LOCALIZAR NOME (primeira linha)
    // ==========================================
    localizarNome(texto, linhas) {
        // Tenta encontrar por rótulo primeiro
        const nome = this.extrairCampo(texto, [
            "criança", "adolescente", "nome completo", 
            "nome da criança", "nome do adolescente",
            "criança/adolescente", "cidadão", "cidadao"
        ]);
        
        if (nome) return nome;
        
        // Se não encontrou, usa a primeira linha que não está vazia
        for (const linha of linhas) {
            const linhaLimpa = linha.trim();
            if (linhaLimpa && 
                !linhaLimpa.includes(':') && 
                !linhaLimpa.includes('data') &&
                !linhaLimpa.includes('atendimento') &&
                linhaLimpa.length < 100) {
                return linhaLimpa;
            }
        }
        return "";
    }

    // ==========================================
    // EXTRAÇÃO PRINCIPAL
    // ==========================================
    extrair(textoOriginal) {
        console.log("🔍 Iniciando extração de dados do PDF...");
        
        const textoNorm = this.normalizar(textoOriginal);
        const linhas = textoOriginal.split('\n').filter(l => l.trim());
        
        // Inicializa dados
        this.dados = {
            nome: "",
            dataAtendimento: "",
            tipoAtendimento: "",
            assunto: "",
            plantonista: "",
            telefone: "",
            endereco: "",
            responsavel: "",
            nascimento: "",
            contato: ""
        };

        // ==========================================
        // 1. EXTRAIR NOME
        // ==========================================
        this.dados.nome = this.localizarNome(textoOriginal, linhas);
        console.log("Nome encontrado:", this.dados.nome);

        // ==========================================
        // 2. EXTRAIR DATA DE NASCIMENTO
        // ==========================================
        const todasDatas = this.localizarDatas(textoOriginal);
        const nascimento = this.extrairCampo(textoOriginal, [
            "data de nascimento", "nascimento", "dt nasc", 
            "data nasc", "dn", "d.n.", "nasc."
        ]);
        
        if (nascimento) {
            const matchData = nascimento.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) {
                this.dados.nascimento = matchData[0];
            }
        }
        
        if (!this.dados.nascimento && todasDatas.length > 1) {
            this.dados.nascimento = todasDatas[1];
        }

        // ==========================================
        // 3. EXTRAIR RESPONSÁVEL
        // ==========================================
        this.dados.responsavel = this.extrairCampo(textoOriginal, [
            "responsável", "responsavel", "responsável legal",
            "genitora", "genitor", "pai", "mãe", "mae"
        ]);

        // ==========================================
        // 4. EXTRAIR ENDEREÇO
        // ==========================================
        this.dados.endereco = this.extrairCampo(textoOriginal, [
            "endereço", "endereco", "logradouro", "residência", "residencia"
        ]);

        // ==========================================
        // 5. EXTRAIR TELEFONE
        // ==========================================
        this.dados.telefone = this.localizarTelefone(textoOriginal);
        
        if (!this.dados.telefone) {
            this.dados.telefone = this.extrairCampo(textoOriginal, [
                "telefone", "fone", "celular", "contato"
            ]);
            if (this.dados.telefone && !/\d/.test(this.dados.telefone)) {
                this.dados.telefone = "";
            }
        }

        // ==========================================
        // 6. EXTRAIR CONTATO
        // ==========================================
        this.dados.contato = this.extrairCampo(textoOriginal, [
            "contato", "telefone para contato"
        ]);
        if (!this.dados.contato) {
            this.dados.contato = this.dados.telefone;
        }

        // ==========================================
        // 7. EXTRAIR DATA DO ATENDIMENTO
        // ==========================================
        const dataAtend = this.extrairCampo(textoOriginal, [
            "data do atendimento", "data atendimento", "data"
        ]);
        
        if (dataAtend) {
            const matchData = dataAtend.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) {
                this.dados.dataAtendimento = matchData[0];
            }
        }
        
        if (!this.dados.dataAtendimento && todasDatas.length > 0) {
            this.dados.dataAtendimento = todasDatas[0];
        }

        // ==========================================
        // 8. EXTRAIR TIPO DE ATENDIMENTO
        // ==========================================
        this.dados.tipoAtendimento = this.extrairCampo(textoOriginal, [
            "tipo de atendimento", "atendimento", "modalidade"
        ]);

        // Se não encontrou, tenta identificar
        if (!this.dados.tipoAtendimento) {
            if (textoNorm.includes("conselheiro")) {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            } else if (textoNorm.includes("balcão") || textoNorm.includes("balcao") || textoNorm.includes("informação")) {
                this.dados.tipoAtendimento = "Ato de Atendimento (Balcão / Informação)";
            } else if (textoNorm.includes("presencial")) {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            } else {
                this.dados.tipoAtendimento = "Ato de Atendimento (Balcão / Informação)";
            }
        }

        // ==========================================
        // 9. EXTRAIR ASSUNTO (completo)
        // ==========================================
        // Tenta encontrar o assunto principal
        let assunto = this.extrairCampo(textoOriginal, [
            "assunto", "motivo", "demanda", "ocorrência", "ocorrencia", "solicitação", "solicitacao"
        ]);

        // Se não encontrou, constrói um assunto baseado nos dados
        if (!assunto) {
            const partesAssunto = [];
            
            if (this.dados.nome) {
                partesAssunto.push(`Nome: ${this.dados.nome}`);
            }
            
            if (this.dados.responsavel) {
                partesAssunto.push(`Responsável: ${this.dados.responsavel}`);
            }
            
            if (this.dados.telefone) {
                partesAssunto.push(`Contato: ${this.dados.telefone}`);
            }
            
            if (this.dados.endereco) {
                partesAssunto.push(`Endereço: ${this.dados.endereco}`);
            }
            
            // Adiciona informações sobre o tipo de atendimento
            if (this.dados.tipoAtendimento && this.dados.tipoAtendimento.includes("Conselheiro")) {
                partesAssunto.push("Necessita atendimento com conselheiro");
            } else {
                partesAssunto.push("Informação/balcão");
            }
            
            assunto = partesAssunto.join(" | ");
        }

        // Limpa o assunto
        this.dados.assunto = assunto
            .replace(/^[:-\s]+/, '')
            .replace(/\s{2,}/g, ' ')
            .trim();

        // ==========================================
        // 10. EXTRAIR PLANTONISTA
        // ==========================================
        this.dados.plantonista = this.extrairCampo(textoOriginal, [
            "plantonista", "conselheiro", "responsável", "atendente",
            "funcionário", "funcionario"
        ]);

        // Se não encontrou, usa "Conselheiro" como padrão
        if (!this.dados.plantonista) {
            this.dados.plantonista = "Conselheiro";
        }

        console.log("✅ Dados extraídos com sucesso!");
        console.table(this.dados);
        
        return this.dados;
    }
}

// ==========================================
// FUNÇÃO GLOBAL PARA PROCESSAR O PDF
// ==========================================
async function processarExtracaoPdf(texto) {
    console.log("========== INICIANDO EXTRAÇÃO ==========");
    
    if (!texto || texto.trim() === "") {
        alert("❌ Nenhum texto encontrado no PDF!");
        return;
    }

    // Extrai os dados
    const extrator = new ExtratorPDF();
    const dados = extrator.extrair(texto);

    // ==========================================
    // FUNÇÃO: Converter Data para Input
    // ==========================================
    function converterDataParaInput(dataStr) {
        if (!dataStr) return "";
        const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            return `${match[3]}-${match[2]}-${match[1]}`;
        }
        return "";
    }

    // ==========================================
    // FUNÇÃO: Aguardar Elemento
    // ==========================================
    function aguardarElemento(id, timeout = 3000) {
        return new Promise((resolve) => {
            let el = document.getElementById(id);
            if (el) {
                resolve(el);
                return;
            }
            
            const inicio = Date.now();
            const intervalo = setInterval(() => {
                el = document.getElementById(id);
                if (el) {
                    clearInterval(intervalo);
                    resolve(el);
                    return;
                }
                if (Date.now() - inicio > timeout) {
                    clearInterval(intervalo);
                    resolve(null);
                }
            }, 100);
        });
    }

    // ==========================================
    // PREENCHER FORMULÁRIO (Adaptado para seus campos)
    // ==========================================
    async function preencherFormulario() {
        console.log("📝 Preenchendo formulário...");
        
        // Aguarda os campos do seu formulário
        const campos = {
            dataAtendimento: await aguardarElemento('dataAtendimento'),
            tipoAtendimento: await aguardarElemento('tipoAtendimento'),
            assuntoAtendimento: await aguardarElemento('assuntoAtendimento'),
            plantonistaAtendimento: await aguardarElemento('plantonistaAtendimento')
        };

        // Preenche a data
        if (campos.dataAtendimento) {
            campos.dataAtendimento.value = converterDataParaInput(dados.dataAtendimento);
        }

        // Preenche o tipo de atendimento (select)
        if (campos.tipoAtendimento && dados.tipoAtendimento) {
            let encontrou = false;
            for (let option of campos.tipoAtendimento.options) {
                if (option.value === dados.tipoAtendimento || 
                    option.text.toLowerCase() === dados.tipoAtendimento.toLowerCase()) {
                    campos.tipoAtendimento.value = option.value;
                    encontrou = true;
                    break;
                }
            }
            
            // Se não encontrou, adiciona como opção
            if (!encontrou) {
                const novaOpcao = document.createElement('option');
                novaOpcao.value = dados.tipoAtendimento;
                novaOpcao.text = dados.tipoAtendimento;
                campos.tipoAtendimento.appendChild(novaOpcao);
                campos.tipoAtendimento.value = dados.tipoAtendimento;
            }
        }

        // Preenche o assunto com todas as informações
        if (campos.assuntoAtendimento && dados.assunto) {
            // Adiciona informações detalhadas no assunto
            let assuntoCompleto = dados.assunto;
            
            // Se tiver informações adicionais, adiciona no assunto
            if (dados.endereco) {
                assuntoCompleto += `\nEndereço: ${dados.endereco}`;
            }
            if (dados.telefone) {
                assuntoCompleto += `\nTelefone: ${dados.telefone}`;
            }
            if (dados.responsavel) {
                assuntoCompleto += `\nResponsável: ${dados.responsavel}`;
            }
            if (dados.nascimento) {
                assuntoCompleto += `\nNascimento: ${dados.nascimento}`;
            }
            
            campos.assuntoAtendimento.value = assuntoCompleto;
        }

        // Preenche o plantonista
        if (campos.plantonistaAtendimento) {
            campos.plantonistaAtendimento.value = dados.plantonista || 'Conselheiro';
        }

        // ==========================================
        // PREENCHER CAMPOS DE VISUALIZAÇÃO (PDF)
        // ==========================================
        const camposPdf = {
            pdfNome: dados.nome || '—',
            pdfData: dados.dataAtendimento || '—',
            pdfTipo: dados.tipoAtendimento || '—',
            pdfAssunto: dados.assunto || '—',
            pdfPlantonista: dados.plantonista || '—',
            pdfTelefone: dados.telefone || '—',
            pdfEndereco: dados.endereco || '—',
            pdfResponsavel: dados.responsavel || '—',
            pdfNascimento: dados.nascimento || '—'
        };

        Object.keys(camposPdf).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = camposPdf[id];
            }
        });

        // ==========================================
        // SALVAR NO LOCALSTORAGE
        // ==========================================
        try {
            const dadosCompletos = {
                ...dados,
                dataExtraida: new Date().toISOString()
            };
            localStorage.setItem('dadosPdfExtraidos', JSON.stringify(dadosCompletos));
            localStorage.setItem('dadosAtendimentoGlobal', JSON.stringify(dadosCompletos));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }

        console.log("✅ Formulário preenchido com sucesso!");
    }

    // Executa o preenchimento
    await preencherFormulario();

    // ==========================================
    // MOSTRA CONFIRMAÇÃO
    // ==========================================
    const mensagem = `
📄 PDF IMPORTADO COM SUCESSO!

👤 Nome: ${dados.nome || '—'}
📅 Data Atendimento: ${dados.dataAtendimento || '—'}
📋 Tipo: ${dados.tipoAtendimento || '—'}
📝 Assunto: ${dados.assunto || '—'}
👨‍💼 Plantonista: ${dados.plantonista || '—'}

📞 Telefone: ${dados.telefone || '—'}
📍 Endereço: ${dados.endereco || '—'}
👤 Responsável: ${dados.responsavel || '—'}
📅 Nascimento: ${dados.nascimento || '—'}

✅ Todos os campos foram preenchidos automaticamente!
    `;

    alert(mensagem);
    console.log("========== EXTRAÇÃO FINALIZADA ==========");
}

console.log("📄 Extrator de PDF carregado com sucesso!");
