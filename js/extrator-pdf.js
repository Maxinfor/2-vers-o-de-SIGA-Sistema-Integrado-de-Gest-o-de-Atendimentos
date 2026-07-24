/* ==========================================================
   SIGACTPAR - EXTRATOR DE PDF
========================================================== */

class ExtratorPDF {
    constructor() {
        this.dados = {};
    }

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

    localizarDatas(texto) {
        return texto.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g) || [];
    }

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

    localizarNome(texto, linhas) {
        const nome = this.extrairCampo(texto, [
            "criança", "adolescente", "nome completo", 
            "nome da criança", "nome do adolescente",
            "criança/adolescente", "cidadão", "cidadao"
        ]);
        
        if (nome) return nome;
        
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

    extrair(textoOriginal) {
        console.log("🔍 Iniciando extração de dados do PDF...");
        
        const linhas = textoOriginal.split('\n').filter(l => l.trim());
        
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

        // Nome
        this.dados.nome = this.localizarNome(textoOriginal, linhas);

        // Data de Nascimento
        const todasDatas = this.localizarDatas(textoOriginal);
        const nascimento = this.extrairCampo(textoOriginal, [
            "data de nascimento", "nascimento", "dt nasc", "data nasc", "dn"
        ]);
        
        if (nascimento) {
            const matchData = nascimento.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) this.dados.nascimento = matchData[0];
        }
        if (!this.dados.nascimento && todasDatas.length > 1) {
            this.dados.nascimento = todasDatas[1];
        }

        // Responsável
        this.dados.responsavel = this.extrairCampo(textoOriginal, [
            "responsável", "responsavel", "responsável legal", "genitora", "genitor", "pai", "mãe", "mae"
        ]);

        // Endereço
        this.dados.endereco = this.extrairCampo(textoOriginal, [
            "endereço", "endereco", "logradouro", "residência", "residencia"
        ]);

        // Telefone
        this.dados.telefone = this.localizarTelefone(textoOriginal);
        if (!this.dados.telefone) {
            this.dados.telefone = this.extrairCampo(textoOriginal, ["telefone", "fone", "celular", "contato"]);
            if (this.dados.telefone && !/\d/.test(this.dados.telefone)) {
                this.dados.telefone = "";
            }
        }

        // Contato
        this.dados.contato = this.extrairCampo(textoOriginal, ["contato", "telefone para contato"]);
        if (!this.dados.contato) this.dados.contato = this.dados.telefone;

        // Data do Atendimento
        const dataAtend = this.extrairCampo(textoOriginal, ["data do atendimento", "data atendimento", "data"]);
        if (dataAtend) {
            const matchData = dataAtend.match(/\d{2}\/\d{2}\/\d{4}/);
            if (matchData) this.dados.dataAtendimento = matchData[0];
        }
        if (!this.dados.dataAtendimento && todasDatas.length > 0) {
            this.dados.dataAtendimento = todasDatas[0];
        }

        // Tipo de Atendimento
        const textoNorm = this.normalizar(textoOriginal);
        this.dados.tipoAtendimento = this.extrairCampo(textoOriginal, [
            "tipo de atendimento", "atendimento", "modalidade"
        ]);

        if (!this.dados.tipoAtendimento) {
            if (textoNorm.includes("conselheiro")) {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            } else if (textoNorm.includes("balcão") || textoNorm.includes("balcao") || textoNorm.includes("informação")) {
                this.dados.tipoAtendimento = "Ato de Atendimento (Balcão / Informação)";
            } else {
                this.dados.tipoAtendimento = "Atendimento com Conselheiro";
            }
        }

        // Assunto
        let assunto = this.extrairCampo(textoOriginal, [
            "assunto", "motivo", "demanda", "ocorrência", "ocorrencia", "solicitação", "solicitacao"
        ]);

        if (!assunto) {
            const partesAssunto = [];
            if (this.dados.nome) partesAssunto.push(`Nome: ${this.dados.nome}`);
            if (this.dados.responsavel) partesAssunto.push(`Responsável: ${this.dados.responsavel}`);
            if (this.dados.telefone) partesAssunto.push(`Contato: ${this.dados.telefone}`);
            if (this.dados.endereco) partesAssunto.push(`Endereço: ${this.dados.endereco}`);
            assunto = partesAssunto.join(" | ");
        }

        this.dados.assunto = assunto.replace(/^[:-\s]+/, '').replace(/\s{2,}/g, ' ').trim();

        // Plantonista
        this.dados.plantonista = this.extrairCampo(textoOriginal, [
            "plantonista", "conselheiro", "responsável", "atendente"
        ]);
        if (!this.dados.plantonista) this.dados.plantonista = "Conselheiro";

        console.log("✅ Dados extraídos:", this.dados);
        return this.dados;
    }
}

// ==========================================
// FUNÇÃO GLOBAL
// ==========================================
async function processarExtracaoPdf(texto) {
    console.log("========== INICIANDO EXTRAÇÃO ==========");
    
    if (!texto || texto.trim() === "") {
        alert("❌ Nenhum texto encontrado no PDF!");
        return;
    }

    const extrator = new ExtratorPDF();
    const dados = extrator.extrair(texto);

    function converterDataParaInput(dataStr) {
        if (!dataStr) return "";
        const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) return `${match[3]}-${match[2]}-${match[1]}`;
        return "";
    }

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

    async function preencherFormulario() {
        console.log("📝 Preenchendo formulário...");
        
        const campos = {
            dataAtendimento: await aguardarElemento('dataAtendimento'),
            tipoAtendimento: await aguardarElemento('tipoAtendimento'),
            assuntoAtendimento: await aguardarElemento('assuntoAtendimento'),
            plantonistaAtendimento: await aguardarElemento('plantonistaAtendimento')
        };

        if (campos.dataAtendimento) {
            campos.dataAtendimento.value = converterDataParaInput(dados.dataAtendimento);
        }

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
            if (!encontrou) {
                const novaOpcao = document.createElement('option');
                novaOpcao.value = dados.tipoAtendimento;
                novaOpcao.text = dados.tipoAtendimento;
                campos.tipoAtendimento.appendChild(novaOpcao);
                campos.tipoAtendimento.value = dados.tipoAtendimento;
            }
        }

        if (campos.assuntoAtendimento && dados.assunto) {
            let assuntoCompleto = dados.assunto;
            if (dados.endereco) assuntoCompleto += `\nEndereço: ${dados.endereco}`;
            if (dados.telefone) assuntoCompleto += `\nTelefone: ${dados.telefone}`;
            if (dados.responsavel) assuntoCompleto += `\nResponsável: ${dados.responsavel}`;
            if (dados.nascimento) assuntoCompleto += `\nNascimento: ${dados.nascimento}`;
            campos.assuntoAtendimento.value = assuntoCompleto;
        }

        if (campos.plantonistaAtendimento) {
            campos.plantonistaAtendimento.value = dados.plantonista || 'Conselheiro';
        }

        // Campos de visualização
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
            if (el) el.textContent = camposPdf[id];
        });

        try {
            localStorage.setItem('dadosPdfExtraidos', JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }

        console.log("✅ Formulário preenchido!");
    }

    await preencherFormulario();

    const mensagem = `
📄 PDF IMPORTADO COM SUCESSO!

👤 Nome: ${dados.nome || '—'}
📅 Data: ${dados.dataAtendimento || '—'}
📋 Tipo: ${dados.tipoAtendimento || '—'}
📝 Assunto: ${dados.assunto || '—'}
👨‍💼 Plantonista: ${dados.plantonista || '—'}
📞 Telefone: ${dados.telefone || '—'}
📍 Endereço: ${dados.endereco || '—'}
👤 Responsável: ${dados.responsavel || '—'}
📅 Nascimento: ${dados.nascimento || '—'}
    `;

    alert(mensagem);
    console.log("========== EXTRAÇÃO FINALIZADA ==========");
}

console.log("📄 Extrator de PDF carregado!");
