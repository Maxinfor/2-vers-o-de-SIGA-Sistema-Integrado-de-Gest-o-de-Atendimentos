/* ==========================================================
   SIGACTPAR - EXTRATOR DE PDF (VERSÃO SIMPLIFICADA)
========================================================== */

class ExtratorPDF {
    constructor() {
        this.dados = {};
    }

    // ==========================================
    // NORMALIZAÇÃO
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
    // LOCALIZAR NOME (primeira linha significativa)
    // ==========================================
    localizarNome(texto, linhas) {
        const nome = this.extrairCampo(texto, [
            "criança", "adolescente", "nome completo", 
            "nome da criança", "nome do adolescente",
            "criança/adolescente", "cidadão", "cidadao",
            "nome", "paciente"
        ]);
        
        if (nome) return nome;
        
        for (const linha of linhas) {
            const linhaLimpa = linha.trim();
            if (linhaLimpa && 
                !linhaLimpa.includes(':') && 
                !linhaLimpa.includes('data') &&
                !linhaLimpa.includes('atendimento') &&
                linhaLimpa.length < 100 &&
                linhaLimpa.length > 3) {
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
        
        const linhas = textoOriginal.split('\n').filter(l => l.trim());
        const textoNorm = this.normalizar(textoOriginal);
        
        this.dados = {
            // Para o formulário de atendimentos
            dataAtendimento: "",
            tipoAtendimento: "",
            assunto: "",
            plantonista: "",
            
            // Informações adicionais (para pré-visualização)
            nome: "",
            nascimento: "",
            responsavel: "",
            endereco: "",
            telefone: "",
            contato: "",
            escola: "",
            serie: "",
            processo: "",
            vara: "",
            juiz: "",
            promotor: ""
        };

        // ==========================================
        // 1. NOME
        // ==========================================
        this.dados.nome = this.localizarNome(textoOriginal, linhas);
        console.log("Nome:", this.dados.nome);

        // ==========================================
        // 2. DATA DE NASCIMENTO
        // ==========================================
        const todasDatas = this.localizarDatas(textoOriginal);
        
        const nascimento = this.extrairCampo(textoOriginal, [
            "data de nascimento", "nascimento", "dt nasc", 
            "data nasc", "dn", "d.n.", "nasc."
        ]);
        
        if (nascimento) {
            const matchData = nascimento.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) this.dados.nascimento = matchData[0];
        }
        
        if (!this.dados.nascimento && todasDatas.length > 1) {
            this.dados.nascimento = todasDatas[1];
        }

        // ==========================================
        // 3. RESPONSÁVEL
        // ==========================================
        this.dados.responsavel = this.extrairCampo(textoOriginal, [
            "responsável", "responsavel", "responsável legal",
            "genitora", "genitor", "pai", "mãe", "mae",
            "representante legal"
        ]);

        // ==========================================
        // 4. ENDEREÇO
        // ==========================================
        let endereco = this.extrairCampo(textoOriginal, [
            "endereço", "endereco", "logradouro", "residência", "residencia"
        ]);
        
        if (!endereco) {
            const padraoEndereco = /(?:Rua|Av|Alameda|Quadra|Q[0-9]|Conjunto|Lote|Sítio|Fazenda)[\s]+[^,\n]+/i;
            const matchEnd = textoOriginal.match(padraoEndereco);
            if (matchEnd) endereco = matchEnd[0].trim();
        }
        this.dados.endereco = endereco;

        // ==========================================
        // 5. TELEFONE
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
        // 6. CONTATO
        // ==========================================
        this.dados.contato = this.extrairCampo(textoOriginal, [
            "contato", "telefone para contato"
        ]);
        if (!this.dados.contato) this.dados.contato = this.dados.telefone;

        // ==========================================
        // 7. ESCOLA
        // ==========================================
        this.dados.escola = this.extrairCampo(textoOriginal, [
            "escola", "colégio", "colegio", "instituição", "instituicao"
        ]);

        // ==========================================
        // 8. SÉRIE
        // ==========================================
        this.dados.serie = this.extrairCampo(textoOriginal, [
            "série", "serie", "ano escolar", "turma", "classe"
        ]);

        // ==========================================
        // 9. DATA DO ATENDIMENTO (PRINCIPAL)
        // ==========================================
        const dataAtend = this.extrairCampo(textoOriginal, [
            "data do atendimento", "data atendimento", "data"
        ]);
        
        if (dataAtend) {
            const matchData = dataAtend.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) this.dados.dataAtendimento = matchData[0];
        }
        
        if (!this.dados.dataAtendimento && todasDatas.length > 0) {
            this.dados.dataAtendimento = todasDatas[0];
        }
        console.log("Data Atendimento:", this.dados.dataAtendimento);

        // ==========================================
        // 10. TIPO DE ATENDIMENTO
        // ==========================================
        this.dados.tipoAtendimento = this.extrairCampo(textoOriginal, [
            "tipo de atendimento", "atendimento", "modalidade"
        ]);

        if (!this.dados.tipoAtendimento) {
            if (textoNorm.includes("conselheiro") || textoNorm.includes("consulta")) {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            } else if (textoNorm.includes("balcão") || textoNorm.includes("balcao") || textoNorm.includes("informação")) {
                this.dados.tipoAtendimento = "Ato de Atendimento (Balcão / Informação)";
            } else if (textoNorm.includes("telefone") || textoNorm.includes("telefonico")) {
                this.dados.tipoAtendimento = "Atendimento Telefônico";
            } else if (textoNorm.includes("online") || textoNorm.includes("virtual")) {
                this.dados.tipoAtendimento = "Atendimento Online";
            } else {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            }
        }
        console.log("Tipo Atendimento:", this.dados.tipoAtendimento);

        // ==========================================
        // 11. ASSUNTO (PRINCIPAL)
        // ==========================================
        let assunto = this.extrairCampo(textoOriginal, [
            "assunto", "motivo", "demanda", "ocorrência", "ocorrencia", 
            "solicitação", "solicitacao", "relato", "descrição", "descricao"
        ]);

        if (!assunto) {
            const partesAssunto = [];
            if (this.dados.nome) partesAssunto.push(`Nome: ${this.dados.nome}`);
            if (this.dados.responsavel) partesAssunto.push(`Responsável: ${this.dados.responsavel}`);
            if (this.dados.telefone) partesAssunto.push(`Contato: ${this.dados.telefone}`);
            if (this.dados.endereco) partesAssunto.push(`Endereço: ${this.dados.endereco}`);
            if (this.dados.escola) partesAssunto.push(`Escola: ${this.dados.escola}`);
            
            if (textoNorm.includes("abuso")) {
                partesAssunto.push("Suspeita de abuso");
            } else if (textoNorm.includes("violência") || textoNorm.includes("violencia")) {
                partesAssunto.push("Violência");
            } else if (textoNorm.includes("abandono")) {
                partesAssunto.push("Abandono");
            } else if (textoNorm.includes("negligência") || textoNorm.includes("negligencia")) {
                partesAssunto.push("Negligência");
            }
            
            assunto = partesAssunto.join(" | ");
        }

        this.dados.assunto = assunto.replace(/^[:-\s]+/, '').replace(/\s{2,}/g, ' ').trim();
        console.log("Assunto:", this.dados.assunto);

        // ==========================================
        // 12. PLANTONISTA (PRINCIPAL)
        // ==========================================
        this.dados.plantonista = this.extrairCampo(textoOriginal, [
            "plantonista", "conselheiro", "responsável", "atendente",
            "funcionário", "funcionario", "profissional"
        ]);
        
        if (!this.dados.plantonista) {
            this.dados.plantonista = "Conselheiro Tutelar";
        }
        console.log("Plantonista:", this.dados.plantonista);

        // ==========================================
        // 13. PROCESSO
        // ==========================================
        this.dados.processo = this.extrairCampo(textoOriginal, [
            "processo", "número", "numero", "protocolo", "registro"
        ]);
        
        if (!this.dados.processo) {
            const padraoProcesso = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/;
            const matchProc = textoOriginal.match(padraoProcesso);
            if (matchProc) this.dados.processo = matchProc[0];
        }

        // ==========================================
        // 14. VARA
        // ==========================================
        this.dados.vara = this.extrairCampo(textoOriginal, [
            "vara", "comarca", "juizado", "tribunal"
        ]);

        // ==========================================
        // 15. JUIZ
        // ==========================================
        this.dados.juiz = this.extrairCampo(textoOriginal, [
            "juiz", "juiZ", "magistrado"
        ]);

        // ==========================================
        // 16. PROMOTOR
        // ==========================================
        this.dados.promotor = this.extrairCampo(textoOriginal, [
            "promotor", "promotora", "ministério público", "ministerio publico"
        ]);

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

    const extrator = new ExtratorPDF();
    const dados = extrator.extrair(texto);

    // ==========================================
    // FUNÇÃO: Converter Data para Input (DD/MM/AAAA -> AAAA-MM-DD)
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
    // PREENCHER FORMULÁRIO (APENAS CAMPOS EXISTENTES)
    // ==========================================
    async function preencherFormulario() {
        console.log("📝 Preenchendo formulário de atendimentos...");
        
        // Aguarda os campos do seu formulário
        const dataInput = await aguardarElemento('dataAtendimento');
        const tipoSelect = await aguardarElemento('tipoAtendimento');
        const assuntoTextarea = await aguardarElemento('assuntoAtendimento');
        const plantonistaInput = await aguardarElemento('plantonistaAtendimento');

        // 1. Preenche a DATA
        if (dataInput && dados.dataAtendimento) {
            const dataFormatada = converterDataParaInput(dados.dataAtendimento);
            if (dataFormatada) {
                dataInput.value = dataFormatada;
                console.log(`✅ Data preenchida: ${dataFormatada}`);
            }
        }

        // 2. Preenche o TIPO (select)
        if (tipoSelect && dados.tipoAtendimento) {
            let encontrou = false;
            for (let option of tipoSelect.options) {
                if (option.value === dados.tipoAtendimento || 
                    option.text.toLowerCase() === dados.tipoAtendimento.toLowerCase()) {
                    tipoSelect.value = option.value;
                    encontrou = true;
                    break;
                }
            }
            
            if (!encontrou) {
                const novaOpcao = document.createElement('option');
                novaOpcao.value = dados.tipoAtendimento;
                novaOpcao.text = dados.tipoAtendimento;
                tipoSelect.appendChild(novaOpcao);
                tipoSelect.value = dados.tipoAtendimento;
                console.log(`✅ Tipo adicionado: ${dados.tipoAtendimento}`);
            } else {
                console.log(`✅ Tipo preenchido: ${tipoSelect.value}`);
            }
        }

        // 3. Preenche o ASSUNTO
        if (assuntoTextarea && dados.assunto) {
            // Constrói um assunto completo com todas as informações
            let assuntoCompleto = dados.assunto;
            
            // Adiciona informações adicionais se disponíveis
            const infoAdicional = [];
            if (dados.nome && !assuntoCompleto.includes(dados.nome)) {
                infoAdicional.push(`Nome: ${dados.nome}`);
            }
            if (dados.responsavel && !assuntoCompleto.includes(dados.responsavel)) {
                infoAdicional.push(`Responsável: ${dados.responsavel}`);
            }
            if (dados.telefone && !assuntoCompleto.includes(dados.telefone)) {
                infoAdicional.push(`Telefone: ${dados.telefone}`);
            }
            if (dados.endereco && !assuntoCompleto.includes(dados.endereco)) {
                infoAdicional.push(`Endereço: ${dados.endereco}`);
            }
            if (dados.nascimento && !assuntoCompleto.includes(dados.nascimento)) {
                infoAdicional.push(`Nascimento: ${dados.nascimento}`);
            }
            if (dados.escola && !assuntoCompleto.includes(dados.escola)) {
                infoAdicional.push(`Escola: ${dados.escola}`);
            }
            if (dados.serie && !assuntoCompleto.includes(dados.serie)) {
                infoAdicional.push(`Série: ${dados.serie}`);
            }
            
            if (infoAdicional.length > 0) {
                assuntoCompleto += "\n\n" + infoAdicional.join("\n");
            }
            
            assuntoTextarea.value = assuntoCompleto;
            console.log(`✅ Assunto preenchido: ${assuntoCompleto.substring(0, 50)}...`);
        }

        // 4. Preenche o PLANTONISTA
        if (plantonistaInput && dados.plantonista) {
            plantonistaInput.value = dados.plantonista;
            console.log(`✅ Plantonista preenchido: ${dados.plantonista}`);
        }

        // ==========================================
        // ATUALIZA PRÉ-VISUALIZAÇÃO
        // ==========================================
        const camposPdf = {
            pdfNome: dados.nome || '—',
            pdfNascimento: dados.nascimento || '—',
            pdfResponsavel: dados.responsavel || '—',
            pdfEndereco: dados.endereco || '—',
            pdfTelefone: dados.telefone || '—',
            pdfEscola: dados.escola || '—',
            pdfSerie: dados.serie || '—',
            pdfData: dados.dataAtendimento || '—',
            pdfTipo: dados.tipoAtendimento || '—',
            pdfAssunto: dados.assunto || '—',
            pdfPlantonista: dados.plantonista || '—',
            pdfProcesso: dados.processo || '—',
            pdfVara: dados.vara || '—',
            pdfJuiz: dados.juiz || '—',
            pdfPromotor: dados.promotor || '—'
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
            localStorage.setItem('dadosPdfExtraidos', JSON.stringify(dados));
            localStorage.setItem('ultimoPdfImportado', JSON.stringify({
                dados: dados,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }

        console.log("✅ Formulário preenchido com sucesso!");
        
        // ==========================================
        // DISPARA EVENTO PARA ATUALIZAR A TABELA
        // ==========================================
        // Tenta salvar automaticamente o atendimento
        if (dataInput && tipoSelect && assuntoTextarea && plantonistaInput) {
            const data = dataInput.value;
            const tipo = tipoSelect.value;
            const assunto = assuntoTextarea.value;
            const plantonista = plantonistaInput.value;
            
            if (data && tipo && assunto && plantonista) {
                // Salva no sistema de atendimentos
                try {
                    let atendimentos = [];
                    const dadosAtend = localStorage.getItem('atendimentos');
                    if (dadosAtend) {
                        atendimentos = JSON.parse(dadosAtend);
                    }
                    
                    const novoId = atendimentos.length > 0 ? Math.max(...atendimentos.map(a => a.id)) + 1 : 1;
                    const novoAtendimento = {
                        id: novoId,
                        data: data,
                        tipo: tipo,
                        assunto: assunto,
                        plantonista: plantonista
                    };
                    
                    atendimentos.push(novoAtendimento);
                    localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
                    
                    // Atualiza a tabela se a função existir
                    if (typeof renderizarAtendimentos === 'function') {
                        renderizarAtendimentos();
                    }
                    
                    console.log('✅ Atendimento salvo automaticamente!');
                } catch (e) {
                    console.error('Erro ao salvar atendimento:', e);
                }
            }
        }
    }

    // Executa o preenchimento
    await preencherFormulario();

    // ==========================================
    // MOSTRA CONFIRMAÇÃO
    // ==========================================
    const mensagem = `
📄 PDF IMPORTADO COM SUCESSO!

📋 ATENDIMENTO
━━━━━━━━━━━━━━━━━━━━
📅 Data: ${dados.dataAtendimento || '—'}
📋 Tipo: ${dados.tipoAtendimento || '—'}
📝 Assunto: ${dados.assunto || '—'}
👨‍💼 Plantonista: ${dados.plantonista || '—'}

👶 CRIANÇA/ADOLESCENTE
━━━━━━━━━━━━━━━━━━━━
Nome: ${dados.nome || '—'}
Nascimento: ${dados.nascimento || '—'}
Responsável: ${dados.responsavel || '—'}
Telefone: ${dados.telefone || '—'}
Endereço: ${dados.endereco || '—'}
Escola: ${dados.escola || '—'}
Série: ${dados.serie || '—'}

⚖️ PROCESSO
━━━━━━━━━━━━━━━━━━━━
Número: ${dados.processo || '—'}
Vara: ${dados.vara || '—'}
Juiz: ${dados.juiz || '—'}
Promotor: ${dados.promotor || '—'}

✅ Dados inseridos no formulário!
    `;

    alert(mensagem);
    console.log("========== EXTRAÇÃO FINALIZADA ==========");
}

console.log("📄 Extrator de PDF carregado!");
