/* ==========================================================
   SIGACTPAR - EXTRATOR DE PDF (VERSÃO FINAL)
   COM INTEGRAÇÃO PARA TODOS OS MÓDULOS
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
            // Criança
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
            cpf: "",
            
            // Atendimento
            dataAtendimento: "",
            tipoAtendimento: "",
            assunto: "",
            plantonista: "",
            
            // Processo
            processo: "",
            vara: "",
            juiz: "",
            promotor: "",
            
            // Geral
            observacao: ""
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
            const padraoEndereco = /(?:Rua|Av|Alameda|Quadra|Q[0-9]|Conjunto|Lote|Sítio|Fazenda)[\s]+[^,\n]+/i;
            const matchEnd = textoOriginal.match(padraoEndereco);
            if (matchEnd) endereco = matchEnd[0].trim();
        }
        this.dados.endereco = endereco;
        console.log("Endereço:", this.dados.endereco);

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
        console.log("Telefone:", this.dados.telefone);

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
        console.log("Escola:", this.dados.escola);

        // ==========================================
        // 8. SÉRIE
        // ==========================================
        this.dados.serie = this.extrairCampo(textoOriginal, [
            "série", "serie", "ano escolar", "turma", "classe"
        ]);
        console.log("Série:", this.dados.serie);

        // ==========================================
        // 9. CPF
        // ==========================================
        this.dados.cpf = this.extrairCampo(textoOriginal, [
            "cpf", "CPF"
        ]);
        // Tenta encontrar CPF no formato 000.000.000-00
        if (!this.dados.cpf) {
            const cpfMatch = textoOriginal.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
            if (cpfMatch) this.dados.cpf = cpfMatch[0];
        }
        console.log("CPF:", this.dados.cpf);

        // ==========================================
        // 10. DATA DO ATENDIMENTO
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
        // 11. TIPO DE ATENDIMENTO
        // ==========================================
        this.dados.tipoAtendimento = this.extrairCampo(textoOriginal, [
            "tipo de atendimento", "atendimento", "modalidade"
        ]);

        if (!this.dados.tipoAtendimento) {
            if (textoNorm.includes("conselheiro") || textoNorm.includes("consulta")) {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            } else if (textoNorm.includes("balcão") || textoNorm.includes("balcao") || textoNorm.includes("informação")) {
                this.dados.tipoAtendimento = "Ato de Atendimento (Balcão / Informação)";
            } else {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            }
        }
        console.log("Tipo Atendimento:", this.dados.tipoAtendimento);

        // ==========================================
        // 12. ASSUNTO
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
        // 13. PLANTONISTA
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
        // 14. PROCESSO
        // ==========================================
        this.dados.processo = this.extrairCampo(textoOriginal, [
            "processo", "número", "numero", "protocolo", "registro"
        ]);
        
        if (!this.dados.processo) {
            const padraoProcesso = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/;
            const matchProc = textoOriginal.match(padraoProcesso);
            if (matchProc) this.dados.processo = matchProc[0];
        }
        console.log("Processo:", this.dados.processo);

        // ==========================================
        // 15. VARA
        // ==========================================
        this.dados.vara = this.extrairCampo(textoOriginal, [
            "vara", "comarca", "juizado", "tribunal"
        ]);
        console.log("Vara:", this.dados.vara);

        // ==========================================
        // 16. JUIZ
        // ==========================================
        this.dados.juiz = this.extrairCampo(textoOriginal, [
            "juiz", "juiZ", "magistrado"
        ]);
        console.log("Juiz:", this.dados.juiz);

        // ==========================================
        // 17. PROMOTOR
        // ==========================================
        this.dados.promotor = this.extrairCampo(textoOriginal, [
            "promotor", "promotora", "ministério público", "ministerio publico"
        ]);
        console.log("Promotor:", this.dados.promotor);

        // ==========================================
        // 18. OBSERVAÇÃO
        // ==========================================
        const camposExtraidos = [
            this.dados.nome, this.dados.nascimento, this.dados.responsavel,
            this.dados.endereco, this.dados.telefone, this.dados.contato,
            this.dados.assunto, this.dados.tipoAtendimento, this.dados.dataAtendimento,
            this.dados.escola, this.dados.serie, this.dados.processo,
            this.dados.cpf, this.dados.vara, this.dados.juiz, this.dados.promotor
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
    // SALVA DADOS NO LOCALSTORAGE
    // ==========================================
    try {
        localStorage.setItem('dadosPdfExtraidos', JSON.stringify(dados));
        localStorage.setItem('ultimoPdfImportado', JSON.stringify({
            dados: dados,
            timestamp: new Date().toISOString()
        }));
        console.log('✅ Dados salvos no localStorage!');
    } catch (e) {
        console.error('Erro ao salvar:', e);
    }

    // ==========================================
    // 1. PREENCHER ATENDIMENTOS
    // ==========================================
    console.log('📝 Preenchendo Atendimentos...');
    if (typeof preencherAtendimentoDoPDF === 'function') {
        preencherAtendimentoDoPDF(dados);
    } else {
        console.warn('⚠️ Função preencherAtendimentoDoPDF não encontrada!');
        // Fallback: tenta preencher diretamente os campos
        await preencherAtendimentoDireto(dados);
    }

    // ==========================================
    // 2. PREENCHER CRIANÇAS
    // ==========================================
    console.log('📝 Preenchendo Crianças...');
    if (typeof preencherCriancaDoPDF === 'function') {
        preencherCriancaDoPDF(dados);
    } else {
        console.warn('⚠️ Função preencherCriancaDoPDF não encontrada!');
        // Fallback: tenta preencher diretamente
        await preencherCriancaDireto(dados);
    }

    // ==========================================
    // 3. PREENCHER RESPONSÁVEIS
    // ==========================================
    console.log('📝 Preenchendo Responsáveis...');
    if (typeof preencherResponsavelDoPDF === 'function') {
        preencherResponsavelDoPDF(dados);
    } else {
        console.warn('⚠️ Função preencherResponsavelDoPDF não encontrada!');
        await preencherResponsavelDireto(dados);
    }

    // ==========================================
    // 4. ATUALIZA PRÉ-VISUALIZAÇÃO
    // ==========================================
    atualizarPreview(dados);

    // ==========================================
    // 5. MOSTRA CONFIRMAÇÃO
    // ==========================================
    const mensagem = `
📄 PDF IMPORTADO COM SUCESSO!

👶 CRIANÇA
━━━━━━━━━━━━━━━━━━━━
Nome: ${dados.nome || '—'}
Nascimento: ${dados.nascimento || '—'}
Responsável: ${dados.responsavel || '—'}
Telefone: ${dados.telefone || '—'}
Endereço: ${dados.endereco || '—'}
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
Nº: ${dados.processo || '—'}
Vara: ${dados.vara || '—'}
Juiz: ${dados.juiz || '—'}

✅ Todos os módulos foram preenchidos!
    `;

    alert(mensagem);
    console.log("========== EXTRAÇÃO FINALIZADA ==========");
}

// ==========================================
// FUNÇÕES DE FALLBACK (PREENCHE DIRETO)
// ==========================================
async function preencherAtendimentoDireto(dados) {
    console.log('🔄 Fallback: Preenchendo Atendimento diretamente...');
    
    const campos = {
        dataAtendimento: document.getElementById('dataAtendimento'),
        tipoAtendimento: document.getElementById('tipoAtendimento'),
        assuntoAtendimento: document.getElementById('assuntoAtendimento'),
        plantonistaAtendimento: document.getElementById('plantonistaAtendimento')
    };

    // Converter data
    function converterData(dataStr) {
        if (!dataStr) return '';
        const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) return `${match[3]}-${match[2]}-${match[1]}`;
        return dataStr;
    }

    if (campos.dataAtendimento && dados.dataAtendimento) {
        campos.dataAtendimento.value = converterData(dados.dataAtendimento);
    }

    if (campos.tipoAtendimento && dados.tipoAtendimento) {
        for (let option of campos.tipoAtendimento.options) {
            if (option.value === dados.tipoAtendimento || 
                option.text.toLowerCase() === dados.tipoAtendimento.toLowerCase()) {
                campos.tipoAtendimento.value = option.value;
                break;
            }
        }
    }

    if (campos.assuntoAtendimento && dados.assunto) {
        campos.assuntoAtendimento.value = dados.assunto;
    }

    if (campos.plantonistaAtendimento && dados.plantonista) {
        campos.plantonistaAtendimento.value = dados.plantonista;
    }

    console.log('✅ Atendimento preenchido (fallback)');
}

async function preencherCriancaDireto(dados) {
    console.log('🔄 Fallback: Preenchendo Criança diretamente...');
    
    function converterData(dataStr) {
        if (!dataStr) return '';
        const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) return `${match[3]}-${match[2]}-${match[1]}`;
        return dataStr;
    }

    const nomeInput = document.getElementById('nomeCrianca');
    if (nomeInput && dados.nome) nomeInput.value = dados.nome;

    const nascimentoInput = document.getElementById('nascimentoCrianca');
    if (nascimentoInput && dados.nascimento) {
        nascimentoInput.value = converterData(dados.nascimento);
    }

    const escolaInput = document.getElementById('escolaCrianca');
    if (escolaInput && dados.escola) escolaInput.value = dados.escola;

    const responsavelInput = document.getElementById('responsavelCrianca');
    if (responsavelInput && dados.responsavel) responsavelInput.value = dados.responsavel;

    const cpfInput = document.getElementById('cpfCrianca');
    if (cpfInput && dados.cpf) cpfInput.value = dados.cpf;

    const observacoesInput = document.getElementById('observacoesCrianca');
    if (observacoesInput) {
        let obs = [];
        if (dados.observacao) obs.push(dados.observacao);
        if (dados.assunto) obs.push(`Assunto: ${dados.assunto}`);
        if (dados.endereco) obs.push(`Endereço: ${dados.endereco}`);
        if (dados.telefone) obs.push(`Telefone: ${dados.telefone}`);
        if (dados.dataAtendimento) obs.push(`Data Atendimento: ${dados.dataAtendimento}`);
        observacoesInput.value = obs.join('\n');
    }

    // Abre o modal
    const modal = document.getElementById('modalCrianca');
    if (modal) modal.style.display = 'flex';

    console.log('✅ Criança preenchida (fallback)');
}

async function preencherResponsavelDireto(dados) {
    console.log('🔄 Fallback: Preenchendo Responsável diretamente...');
    
    const nomeInput = document.getElementById('nomeResponsavel');
    if (nomeInput && dados.responsavel) nomeInput.value = dados.responsavel;

    const telefoneInput = document.getElementById('telefoneResponsavel');
    if (telefoneInput && dados.telefone) telefoneInput.value = dados.telefone;

    const enderecoInput = document.getElementById('enderecoResponsavel');
    if (enderecoInput && dados.endereco) enderecoInput.value = dados.endereco;

    const cpfInput = document.getElementById('cpfResponsavel');
    if (cpfInput && dados.cpf) cpfInput.value = dados.cpf;

    const observacoesInput = document.getElementById('observacoesResponsavel');
    if (observacoesInput) {
        let obs = [];
        if (dados.nome) obs.push(`Criança: ${dados.nome}`);
        if (dados.assunto) obs.push(`Assunto: ${dados.assunto}`);
        if (dados.dataAtendimento) obs.push(`Data Atendimento: ${dados.dataAtendimento}`);
        if (dados.observacao) obs.push(dados.observacao);
        observacoesInput.value = obs.join('\n');
    }

    // Abre o modal
    const modal = document.getElementById('modalResponsavel');
    if (modal) modal.style.display = 'flex';

    console.log('✅ Responsável preenchido (fallback)');
}

// ==========================================
// FUNÇÃO PARA ATUALIZAR PRÉ-VISUALIZAÇÃO
// ==========================================
function atualizarPreview(dados) {
    console.log('📊 Atualizando pré-visualização...');
    
    const campos = {
        pdfNome: dados.nome,
        pdfNascimento: dados.nascimento,
        pdfResponsavel: dados.responsavel,
        pdfEndereco: dados.endereco,
        pdfTelefone: dados.telefone,
        pdfEscola: dados.escola,
        pdfSerie: dados.serie,
        pdfData: dados.dataAtendimento,
        pdfTipo: dados.tipoAtendimento,
        pdfAssunto: dados.assunto,
        pdfPlantonista: dados.plantonista,
        pdfProcesso: dados.processo,
        pdfVara: dados.vara,
        pdfJuiz: dados.juiz,
        pdfPromotor: dados.promotor
    };

    Object.keys(campos).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = campos[id] || '—';
        }
    });

    console.log('✅ Pré-visualização atualizada!');
}

// ==========================================
// EXPORTA FUNÇÕES
// ==========================================
window.processarExtracaoPdf = processarExtracaoPdf;
window.ExtratorPDF = ExtratorPDF;

console.log('📄 Extrator de PDF carregado com sucesso!');
