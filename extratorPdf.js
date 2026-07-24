/* ==========================================================
   SIGACTPAR - EXTRATOR DE PDF (VERSÃO COMPLETA)
   PREENCHE TODOS OS MÓDULOS DO SISTEMA
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
    // EXTRAIR CAMPO
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
    // LOCALIZAR NOME
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
            // Para Crianças/Adolescentes
            nome: "",
            nascimento: "",
            responsavel: "",
            endereco: "",
            telefone: "",
            contato: "",
            escola: "",
            serie: "",
            bairro: "",
            cidade: "",
            
            // Para Atendimentos
            dataAtendimento: "",
            tipoAtendimento: "",
            assunto: "",
            plantonista: "",
            
            // Para Processos
            numeroProcesso: "",
            vara: "",
            juiz: "",
            promotor: "",
            
            // Geral
            observacao: ""
        };

        // ==========================================
        // 1. NOME DA CRIANÇA
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
        console.log("Nascimento:", this.dados.nascimento);

        // ==========================================
        // 3. RESPONSÁVEL
        // ==========================================
        this.dados.responsavel = this.extrairCampo(textoOriginal, [
            "responsável", "responsavel", "responsável legal",
            "genitora", "genitor", "pai", "mãe", "mae",
            "representante legal"
        ]);
        console.log("Responsável:", this.dados.responsavel);

        // ==========================================
        // 4. ENDEREÇO
        // ==========================================
        let endereco = this.extrairCampo(textoOriginal, [
            "endereço", "endereco", "logradouro", "residência", "residencia"
        ]);
        
        if (!endereco) {
            // Tenta encontrar padrão de endereço
            const padraoEndereco = /(?:Rua|Av|Alameda|Quadra|Q[0-9]|Conjunto|Lote|Sítio|Fazenda)[\s]+[^,\n]+/i;
            const matchEnd = textoOriginal.match(padraoEndereco);
            if (matchEnd) endereco = matchEnd[0].trim();
        }
        this.dados.endereco = endereco;
        console.log("Endereço:", this.dados.endereco);

        // ==========================================
        // 5. BAIRRO
        // ==========================================
        this.dados.bairro = this.extrairCampo(textoOriginal, [
            "bairro", "distrito", "localidade"
        ]);
        
        if (!this.dados.bairro && this.dados.endereco) {
            const partes = this.dados.endereco.split(',');
            if (partes.length > 1) {
                const possivelBairro = partes[1].trim();
                if (possivelBairro && !possivelBairro.includes(' ')) {
                    this.dados.bairro = possivelBairro;
                }
            }
        }
        console.log("Bairro:", this.dados.bairro);

        // ==========================================
        // 6. CIDADE
        // ==========================================
        this.dados.cidade = this.extrairCampo(textoOriginal, [
            "cidade", "município", "municipio", "local"
        ]);
        
        if (!this.dados.cidade) {
            this.dados.cidade = "Brasília";
        }
        console.log("Cidade:", this.dados.cidade);

        // ==========================================
        // 7. TELEFONE
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
        console.log("Telefone:", this.dados.telefone);

        // ==========================================
        // 8. CONTATO
        // ==========================================
        this.dados.contato = this.extrairCampo(textoOriginal, [
            "contato", "telefone para contato"
        ]);
        if (!this.dados.contato) this.dados.contato = this.dados.telefone;

        // ==========================================
        // 9. ESCOLA
        // ==========================================
        this.dados.escola = this.extrairCampo(textoOriginal, [
            "escola", "colégio", "colegio", "instituição", "instituicao"
        ]);
        console.log("Escola:", this.dados.escola);

        // ==========================================
        // 10. SÉRIE
        // ==========================================
        this.dados.serie = this.extrairCampo(textoOriginal, [
            "série", "serie", "ano escolar", "turma", "classe"
        ]);
        console.log("Série:", this.dados.serie);

        // ==========================================
        // 11. DATA DO ATENDIMENTO
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
        // 12. TIPO DE ATENDIMENTO
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
        // 13. ASSUNTO
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
            
            // Tenta identificar assunto por palavras-chave
            if (textoNorm.includes("abuso")) {
                partesAssunto.push("Suspeita de abuso");
            } else if (textoNorm.includes("violência") || textoNorm.includes("violencia")) {
                partesAssunto.push("Violência");
            } else if (textoNorm.includes("abandono")) {
                partesAssunto.push("Abandono");
            } else if (textoNorm.includes("negligência") || textoNorm.includes("negligencia")) {
                partesAssunto.push("Negligência");
            } else if (textoNorm.includes("conselho tutelar")) {
                partesAssunto.push("Atendimento Conselho Tutelar");
            }
            
            assunto = partesAssunto.join(" | ");
        }

        this.dados.assunto = assunto.replace(/^[:-\s]+/, '').replace(/\s{2,}/g, ' ').trim();
        console.log("Assunto:", this.dados.assunto);

        // ==========================================
        // 14. PLANTONISTA
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
        // 15. NÚMERO DO PROCESSO
        // ==========================================
        this.dados.numeroProcesso = this.extrairCampo(textoOriginal, [
            "processo", "número", "numero", "protocolo", "registro"
        ]);
        
        // Tenta encontrar padrão de número de processo
        if (!this.dados.numeroProcesso) {
            const padraoProcesso = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/;
            const matchProc = textoOriginal.match(padraoProcesso);
            if (matchProc) this.dados.numeroProcesso = matchProc[0];
        }
        console.log("Número Processo:", this.dados.numeroProcesso);

        // ==========================================
        // 16. VARA
        // ==========================================
        this.dados.vara = this.extrairCampo(textoOriginal, [
            "vara", "comarca", "juizado", "tribunal"
        ]);
        console.log("Vara:", this.dados.vara);

        // ==========================================
        // 17. JUIZ
        // ==========================================
        this.dados.juiz = this.extrairCampo(textoOriginal, [
            "juiz", "juiZ", "magistrado"
        ]);
        console.log("Juiz:", this.dados.juiz);

        // ==========================================
        // 18. PROMOTOR
        // ==========================================
        this.dados.promotor = this.extrairCampo(textoOriginal, [
            "promotor", "promotora", "ministério público", "ministerio publico"
        ]);
        console.log("Promotor:", this.dados.promotor);

        // ==========================================
        // 19. OBSERVAÇÃO
        // ==========================================
        const camposExtraidos = [
            this.dados.nome, this.dados.nascimento, this.dados.responsavel,
            this.dados.endereco, this.dados.telefone, this.dados.contato,
            this.dados.assunto, this.dados.tipoAtendimento, this.dados.dataAtendimento,
            this.dados.escola, this.dados.serie, this.dados.numeroProcesso
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
        console.log("Observação:", this.dados.observacao);

        console.log("✅ Dados extraídos com sucesso!");
        console.table(this.dados);
        
        return this.dados;
    }
}

// ==========================================
// FUNÇÃO GLOBAL PARA PROCESSAR O PDF
// ==========================================
async function processarExtracaoPdf(texto) {
    console.log("========== INICIANDO EXTRAÇÃO COMPLETA ==========");
    
    if (!texto || texto.trim() === "") {
        alert("❌ Nenhum texto encontrado no PDF!");
        return;
    }

    const extrator = new ExtratorPDF();
    const dados = extrator.extrair(texto);

    // ==========================================
    // FUNÇÃO: Converter Data para Input
    // ==========================================
    function converterDataParaInput(dataStr) {
        if (!dataStr) return "";
        const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) return `${match[3]}-${match[2]}-${match[1]}`;
        return "";
    }

    // ==========================================
    // FUNÇÃO: Aguardar Elemento
    // ==========================================
    function aguardarElemento(id, timeout = 3000) {
        return new Promise((resolve) => {
            let el = document.getElementById(id);
            if (el) { resolve(el); return; }
            
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
    // PREENCHER TODOS OS MÓDULOS
    // ==========================================
    async function preencherTodosModulos() {
        console.log("📝 Preenchendo todos os módulos...");

        // ==========================================
        // 1. ATENDIMENTOS
        // ==========================================
        const camposAtendimento = {
            dataAtendimento: await aguardarElemento('dataAtendimento'),
            tipoAtendimento: await aguardarElemento('tipoAtendimento'),
            assuntoAtendimento: await aguardarElemento('assuntoAtendimento'),
            plantonistaAtendimento: await aguardarElemento('plantonistaAtendimento')
        };

        if (camposAtendimento.dataAtendimento) {
            camposAtendimento.dataAtendimento.value = converterDataParaInput(dados.dataAtendimento);
        }

        if (camposAtendimento.tipoAtendimento && dados.tipoAtendimento) {
            let encontrou = false;
            for (let option of camposAtendimento.tipoAtendimento.options) {
                if (option.value === dados.tipoAtendimento || 
                    option.text.toLowerCase() === dados.tipoAtendimento.toLowerCase()) {
                    camposAtendimento.tipoAtendimento.value = option.value;
                    encontrou = true;
                    break;
                }
            }
            if (!encontrou) {
                const novaOpcao = document.createElement('option');
                novaOpcao.value = dados.tipoAtendimento;
                novaOpcao.text = dados.tipoAtendimento;
                camposAtendimento.tipoAtendimento.appendChild(novaOpcao);
                camposAtendimento.tipoAtendimento.value = dados.tipoAtendimento;
            }
        }

        if (camposAtendimento.assuntoAtendimento && dados.assunto) {
            camposAtendimento.assuntoAtendimento.value = dados.assunto;
        }

        if (camposAtendimento.plantonistaAtendimento) {
            camposAtendimento.plantonistaAtendimento.value = dados.plantonista || 'Conselheiro Tutelar';
        }

        // ==========================================
        // 2. CRIANÇAS/ADOLESCENTES
        // ==========================================
        const camposCrianca = {
            nome: await aguardarElemento('txtNomeCrianca') || await aguardarElemento('nomeCrianca'),
            nascimento: await aguardarElemento('txtDataNascimento') || await aguardarElemento('dataNascimento'),
            responsavel: await aguardarElemento('txtResponsavel') || await aguardarElemento('responsavel'),
            endereco: await aguardarElemento('txtEndereco') || await aguardarElemento('endereco'),
            telefone: await aguardarElemento('txtTelefone') || await aguardarElemento('telefone'),
            contato: await aguardarElemento('txtContato') || await aguardarElemento('contato'),
            escola: await aguardarElemento('txtEscola') || await aguardarElemento('escola'),
            serie: await aguardarElemento('txtSerie') || await aguardarElemento('serie'),
            bairro: await aguardarElemento('txtBairro') || await aguardarElemento('bairro'),
            cidade: await aguardarElemento('txtCidade') || await aguardarElemento('cidade')
        };

        if (camposCrianca.nome) camposCrianca.nome.value = dados.nome || '';
        if (camposCrianca.nascimento) camposCrianca.nascimento.value = converterDataParaInput(dados.nascimento);
        if (camposCrianca.responsavel) camposCrianca.responsavel.value = dados.responsavel || '';
        if (camposCrianca.endereco) camposCrianca.endereco.value = dados.endereco || '';
        if (camposCrianca.telefone) camposCrianca.telefone.value = dados.telefone || '';
        if (camposCrianca.contato) camposCrianca.contato.value = dados.contato || '';
        if (camposCrianca.escola) camposCrianca.escola.value = dados.escola || '';
        if (camposCrianca.serie) camposCrianca.serie.value = dados.serie || '';
        if (camposCrianca.bairro) camposCrianca.bairro.value = dados.bairro || '';
        if (camposCrianca.cidade) camposCrianca.cidade.value = dados.cidade || 'Brasília';

        // ==========================================
        // 3. RESPONSÁVEIS
        // ==========================================
        const camposResponsavel = {
            nome: await aguardarElemento('txtNomeResponsavel') || await aguardarElemento('nomeResponsavel'),
            telefone: await aguardarElemento('txtTelefoneResponsavel') || await aguardarElemento('telefoneResponsavel'),
            endereco: await aguardarElemento('txtEnderecoResponsavel') || await aguardarElemento('enderecoResponsavel'),
            contato: await aguardarElemento('txtContatoResponsavel') || await aguardarElemento('contatoResponsavel'),
            parentesco: await aguardarElemento('txtParentesco') || await aguardarElemento('parentesco')
        };

        if (camposResponsavel.nome) camposResponsavel.nome.value = dados.responsavel || '';
        if (camposResponsavel.telefone) camposResponsavel.telefone.value = dados.telefone || '';
        if (camposResponsavel.endereco) camposResponsavel.endereco.value = dados.endereco || '';
        if (camposResponsavel.contato) camposResponsavel.contato.value = dados.contato || '';
        if (camposResponsavel.parentesco) camposResponsavel.parentesco.value = 'Responsável Legal';

        // ==========================================
        // 4. PROCESSOS
        // ==========================================
        const camposProcesso = {
            numero: await aguardarElemento('txtNumeroProcesso') || await aguardarElemento('numeroProcesso'),
            crianca: await aguardarElemento('txtCriancaProcesso') || await aguardarElemento('criancaProcesso'),
            assunto: await aguardarElemento('txtAssuntoProcesso') || await aguardarElemento('assuntoProcesso'),
            data: await aguardarElemento('txtDataProcesso') || await aguardarElemento('dataProcesso'),
            vara: await aguardarElemento('txtVara') || await aguardarElemento('vara'),
            juiz: await aguardarElemento('txtJuiz') || await aguardarElemento('juiz'),
            promotor: await aguardarElemento('txtPromotor') || await aguardarElemento('promotor')
        };

        if (camposProcesso.numero) camposProcesso.numero.value = dados.numeroProcesso || '';
        if (camposProcesso.crianca) camposProcesso.crianca.value = dados.nome || '';
        if (camposProcesso.assunto) camposProcesso.assunto.value = dados.assunto || '';
        if (camposProcesso.data) camposProcesso.data.value = converterDataParaInput(dados.dataAtendimento);
        if (camposProcesso.vara) camposProcesso.vara.value = dados.vara || '';
        if (camposProcesso.juiz) camposProcesso.juiz.value = dados.juiz || '';
        if (camposProcesso.promotor) camposProcesso.promotor.value = dados.promotor || '';

        // ==========================================
        // 5. DASHBOARD (ATUALIZAR CARDS)
        // ==========================================
        const cardAtendimentosDiarios = document.getElementById('cardAtendimentosDiarios');
        const cardAtendimentosMensais = document.getElementById('cardAtendimentosMensais');
        
        if (cardAtendimentosDiarios || cardAtendimentosMensais) {
            // Busca atendimentos salvos
            let atendimentos = [];
            try {
                const dadosAtend = localStorage.getItem('atendimentos');
                if (dadosAtend) atendimentos = JSON.parse(dadosAtend);
            } catch (e) {}
            
            const hoje = new Date().toISOString().split('T')[0];
            const mesAtual = hoje.substring(0, 7);
            
            // Adiciona o novo atendimento se tiver data
            if (dados.dataAtendimento) {
                const dataFormatada = converterDataParaInput(dados.dataAtendimento);
                if (dataFormatada) {
                    const novoAtendimento = {
                        id: atendimentos.length + 1,
                        data: dataFormatada,
                        tipo: dados.tipoAtendimento || 'Atendimento com Conselheiro',
                        assunto: dados.assunto || 'Atendimento registrado',
                        plantonista: dados.plantonista || 'Conselheiro Tutelar'
                    };
                    
                    // Verifica se já existe
                    const existe = atendimentos.some(a => 
                        a.data === dataFormatada && 
                        a.assunto === novoAtendimento.assunto
                    );
                    
                    if (!existe) {
                        atendimentos.push(novoAtendimento);
                        localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
                    }
                }
            }
            
            // Atualiza cards
            const diarios = atendimentos.filter(a => a.data === hoje);
            const mensais = atendimentos.filter(a => a.data.startsWith(mesAtual));
            
            if (cardAtendimentosDiarios) cardAtendimentosDiarios.textContent = diarios.length;
            if (cardAtendimentosMensais) cardAtendimentosMensais.textContent = mensais.length;
        }

        // ==========================================
        // 6. VISUALIZAÇÃO DOS DADOS EXTRAÍDOS
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
            pdfNascimento: dados.nascimento || '—',
            pdfEscola: dados.escola || '—',
            pdfSerie: dados.serie || '—',
            pdfProcesso: dados.numeroProcesso || '—',
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
        // 7. SALVAR DADOS COMPLETOS
        // ==========================================
        try {
            const dadosCompletos = {
                ...dados,
                dataExtraida: new Date().toISOString()
            };
            localStorage.setItem('dadosPdfExtraidos', JSON.stringify(dadosCompletos));
            localStorage.setItem('dadosAtendimentoGlobal', JSON.stringify(dadosCompletos));
            localStorage.setItem('ultimoPdfImportado', JSON.stringify({
                dados: dadosCompletos,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }

        console.log("✅ Todos os módulos preenchidos com sucesso!");
    }

    // Executa o preenchimento
    await preencherTodosModulos();

    // ==========================================
    // MOSTRA CONFIRMAÇÃO DETALHADA
    // ==========================================
    const mensagem = `
📄 PDF IMPORTADO COM SUCESSO!

👶 CRIANÇA/ADOLESCENTE
━━━━━━━━━━━━━━━━━━━━
Nome: ${dados.nome || '—'}
Nascimento: ${dados.nascimento || '—'}
Responsável: ${dados.responsavel || '—'}
Endereço: ${dados.endereco || '—'}
Telefone: ${dados.telefone || '—'}
Escola: ${dados.escola || '—'}
Série: ${dados.serie || '—'}

📋 ATENDIMENTO
━━━━━━━━━━━━━━━━━━━━
Data: ${dados.dataAtendimento || '—'}
Tipo: ${dados.tipoAtendimento || '—'}
Assunto: ${dados.assunto || '—'}
Plantonista: ${dados.plantonista || '—'}

⚖️ PROCESSO
━━━━━━━━━━━━━━━━━━━━
Número: ${dados.numeroProcesso || '—'}
Vara: ${dados.vara || '—'}
Juiz: ${dados.juiz || '—'}
Promotor: ${dados.promotor || '—'}

✅ Todos os módulos foram preenchidos automaticamente!
    `;

    alert(mensagem);
    console.log("========== EXTRAÇÃO FINALIZADA ==========");
}

console.log("📄 Extrator de PDF completo carregado!");
