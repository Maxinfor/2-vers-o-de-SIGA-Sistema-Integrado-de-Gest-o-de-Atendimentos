/* ==========================================================
   SIGACTPAR - EXTRATOR DE PDF (VERSÃO FINAL FUNCIONAL)
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
            // Tenta vários padrões
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
        // Procura no formato DD/MM/AAAA
        const datas = texto.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g) || [];
        return datas;
    }

    // ==========================================
    // LOCALIZAR TELEFONE
    // ==========================================
    localizarTelefone(texto) {
        // Procura números de telefone
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
    // LOCALIZAR ENDEREÇO
    // ==========================================
    localizarEndereco(texto, linhas) {
        // Procura por padrões de endereço
        const padroes = [
            /(?:Rua|Av|Alameda|Quadra|Q[0-9]|Conjunto|Lote)[\s]+[^,\n]+/i,
            /Endere[cç]o:?\s*([^\n]+)/i,
            /(?:Rua|Av|Alameda|Quadra).*?(?=\n|,|$)/i
        ];
        
        for (const padrao of padroes) {
            const match = texto.match(padrao);
            if (match) {
                let endereco = match[0].trim();
                if (endereco.includes(':')) {
                    endereco = endereco.split(':')[1].trim();
                }
                if (endereco.length > 5) {
                    return endereco;
                }
            }
        }
        return "";
    }

    // ==========================================
    // EXTRAÇÃO PRINCIPAL
    // ==========================================
    extrair(textoOriginal) {
        console.log("🔍 Iniciando extração de dados do PDF...");
        
        // Normaliza o texto
        const textoNorm = this.normalizar(textoOriginal);
        const linhas = textoOriginal.split('\n').filter(l => l.trim());
        
        // Inicializa dados
        this.dados = {
            nome: "",
            nascimento: "",
            responsavel: "",
            endereco: "",
            telefone: "",
            contato: "",
            assunto: "",
            atendimento: "",
            data: "",
            observacao: ""
        };

        // ==========================================
        // 1. EXTRAIR NOME
        // ==========================================
        this.dados.nome = this.extrairCampo(textoOriginal, [
            "criança", "adolescente", "nome completo", 
            "nome da criança", "nome do adolescente",
            "criança/adolescente"
        ]);
        
        // Se não encontrou, tenta encontrar na primeira linha
        if (!this.dados.nome && linhas.length > 0) {
            const primeiraLinha = linhas[0];
            if (primeiraLinha.length < 50 && !primeiraLinha.includes(':')) {
                this.dados.nome = primeiraLinha.trim();
            }
        }

        // ==========================================
        // 2. EXTRAIR DATA DE NASCIMENTO
        // ==========================================
        const todasDatas = this.localizarDatas(textoOriginal);
        
        // Procura data de nascimento por rótulo
        const nascimento = this.extrairCampo(textoOriginal, [
            "data de nascimento", "nascimento", "dt nasc", 
            "data nasc", "dn", "d.n."
        ]);
        
        if (nascimento) {
            const matchData = nascimento.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) {
                this.dados.nascimento = matchData[0];
            }
        }
        
        // Se não encontrou, usa a segunda data encontrada
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
        this.dados.endereco = this.localizarEndereco(textoOriginal, linhas);
        
        if (!this.dados.endereco) {
            this.dados.endereco = this.extrairCampo(textoOriginal, [
                "endereço", "endereco", "logradouro", "residência", "residencia"
            ]);
        }

        // ==========================================
        // 5. EXTRAIR TELEFONE
        // ==========================================
        this.dados.telefone = this.localizarTelefone(textoOriginal);
        
        if (!this.dados.telefone) {
            this.dados.telefone = this.extrairCampo(textoOriginal, [
                "telefone", "fone", "celular", "contato"
            ]);
            
            // Verifica se o valor extraído contém números
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
        // 7. EXTRAIR ASSUNTO
        // ==========================================
        this.dados.assunto = this.extrairCampo(textoOriginal, [
            "assunto", "motivo", "demanda", "ocorrência", "ocorrencia"
        ]);

        // Se não encontrou, tenta identificar por palavras-chave
        if (!this.dados.assunto) {
            if (textoNorm.includes("abuso")) {
                this.dados.assunto = "Suspeita de abuso";
            } else if (textoNorm.includes("violência") || textoNorm.includes("violencia")) {
                this.dados.assunto = "Violência";
            } else if (textoNorm.includes("abandono")) {
                this.dados.assunto = "Abandono";
            } else if (textoNorm.includes("negligência") || textoNorm.includes("negligencia")) {
                this.dados.assunto = "Negligência";
            } else if (textoNorm.includes("conselho tutelar")) {
                this.dados.assunto = "Atendimento Conselho Tutelar";
            }
        }

        // ==========================================
        // 8. EXTRAIR TIPO DE ATENDIMENTO
        // ==========================================
        this.dados.atendimento = this.extrairCampo(textoOriginal, [
            "tipo de atendimento", "atendimento", "modalidade"
        ]);

        // Se não encontrou, tenta identificar
        if (!this.dados.atendimento) {
            if (textoNorm.includes("presencial")) {
                this.dados.atendimento = "Presencial";
            } else if (textoNorm.includes("telefônico") || textoNorm.includes("telefonico")) {
                this.dados.atendimento = "Telefônico";
            } else if (textoNorm.includes("online") || textoNorm.includes("on line")) {
                this.dados.atendimento = "Online";
            } else if (textoNorm.includes("contato")) {
                this.dados.atendimento = "Contato";
            } else {
                this.dados.atendimento = "Presencial";
            }
        }

        // ==========================================
        // 9. EXTRAIR DATA DO ATENDIMENTO
        // ==========================================
        const dataAtend = this.extrairCampo(textoOriginal, [
            "data do atendimento", "data atendimento", "data"
        ]);
        
        if (dataAtend) {
            const matchData = dataAtend.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) {
                this.dados.data = matchData[0];
            }
        }
        
        // Se não encontrou, usa a primeira data
        if (!this.dados.data && todasDatas.length > 0) {
            this.dados.data = todasDatas[0];
        }

        // ==========================================
        // 10. OBSERVAÇÕES
        // ==========================================
        // Pega o restante do texto como observação
        const camposExtraidos = [
            this.dados.nome,
            this.dados.nascimento,
            this.dados.responsavel,
            this.dados.endereco,
            this.dados.telefone,
            this.dados.contato,
            this.dados.assunto,
            this.dados.atendimento,
            this.dados.data
        ];
        
        let textoRestante = textoOriginal;
        for (const campo of camposExtraidos) {
            if (campo) {
                textoRestante = textoRestante.replace(campo, '');
            }
        }
        
        this.dados.observacao = textoRestante
            .replace(/\n{3,}/g, '\n\n')
            .trim()
            .substring(0, 500);

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
    // PREENCHER FORMULÁRIO
    // ==========================================
    async function preencherFormulario() {
        console.log("📝 Preenchendo formulário...");
        
        // Aguarda os campos
        const campos = {
            nome: await aguardarElemento('txtNome'),
            nascimento: await aguardarElemento('txtDataNascimento'),
            responsavel: await aguardarElemento('txtResponsavel'),
            endereco: await aguardarElemento('txtEndereco'),
            telefone: await aguardarElemento('txtTelefone'),
            contato: await aguardarElemento('txtContato'),
            assunto: await aguardarElemento('txtAssunto'),
            data: await aguardarElemento('txtData'),
            tipoAtendimento: await aguardarElemento('cmbTipoAtendimento')
        };

        // Preenche os campos
        if (campos.nome) campos.nome.value = dados.nome || '';
        if (campos.nascimento) campos.nascimento.value = converterDataParaInput(dados.nascimento);
        if (campos.responsavel) campos.responsavel.value = dados.responsavel || '';
        if (campos.endereco) campos.endereco.value = dados.endereco || '';
        if (campos.telefone) campos.telefone.value = dados.telefone || '';
        if (campos.contato) campos.contato.value = dados.contato || '';
        if (campos.assunto) campos.assunto.value = dados.assunto || '';
        if (campos.data) campos.data.value = converterDataParaInput(dados.data);
        
        // ComboBox de Tipo de Atendimento
        if (campos.tipoAtendimento && dados.atendimento) {
            let encontrou = false;
            for (let option of campos.tipoAtendimento.options) {
                if (option.text.toLowerCase() === dados.atendimento.toLowerCase()) {
                    campos.tipoAtendimento.value = option.value;
                    encontrou = true;
                    break;
                }
            }
            if (!encontrou) {
                const novaOpcao = document.createElement('option');
                novaOpcao.value = dados.atendimento;
                novaOpcao.text = dados.atendimento;
                campos.tipoAtendimento.appendChild(novaOpcao);
                campos.tipoAtendimento.value = dados.atendimento;
            }
        }

        // ==========================================
        // PREENCHER CAMPOS DE VISUALIZAÇÃO (PDF)
        // ==========================================
        const camposPdf = {
            pdfNome: dados.nome,
            pdfNascimento: dados.nascimento,
            pdfResponsavel: dados.responsavel,
            pdfEndereco: dados.endereco,
            pdfTelefone: dados.telefone,
            pdfContato: dados.contato,
            pdfAssunto: dados.assunto,
            pdfTipo: dados.atendimento,
            pdfData: dados.data
        };

        Object.keys(camposPdf).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = camposPdf[id] || '—';
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

👶 Nome: ${dados.nome || '—'}
📅 Nascimento: ${dados.nascimento || '—'}
👤 Responsável: ${dados.responsavel || '—'}
📍 Endereço: ${dados.endereco || '—'}
📞 Telefone: ${dados.telefone || '—'}
📱 Contato: ${dados.contato || '—'}
📋 Assunto: ${dados.assunto || '—'}
🔄 Atendimento: ${dados.atendimento || '—'}
📆 Data: ${dados.data || '—'}

✅ Todos os campos foram preenchidos automaticamente!
    `;

    alert(mensagem);
    console.log("========== EXTRAÇÃO FINALIZADA ==========");
}

console.log("📄 Extrator de PDF carregado com sucesso!");
