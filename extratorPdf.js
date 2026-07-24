/* ==========================================================
   SIGACTPAR
   MOTOR DE EXTRAÇÃO INTELIGENTE (VERSÃO BLINDADA)
========================================================== */

class ExtratorPDF {

    constructor() {
        this.dados = {};
    }

    /* ===============================================
       Normalização de Texto
    =============================================== */
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

    /* ===============================================
       Estrutura padrão
    =============================================== */
    novoObjeto() {
        return {
            nome: "",
            nascimento: "",
            responsavel: "",
            endereco: "",
            telefone: "",
            contato: "",
            assunto: "",
            atendimento: "",
            data: "",
            processo: "",
            pasta: "",
            cidade: "",
            bairro: "",
            escola: "",
            serie: "",
            plantonista: "",
            observacao: ""
        };
    }

    /* ===============================================
       Extrator Inteligente por Regex e Rótulos
    =============================================== */
    extrairCampoRegex(textoOriginal, rotulos) {
        for (const rotulo of rotulos) {
            // Cria um padrão dinâmico tolerante a dois-pontos, espaços e quebras
            const regex = new RegExp(`${rotulo}\\s*[:\\-]?\\s*([^\\n]+)`, "i");
            const match = textoOriginal.match(regex);
            if (match && match[1]) {
                const valorLimpo = match[1].trim();
                if (valorLimpo && valorLimpo.length > 1) {
                    return valorLimpo;
                }
            }
        }
        return "";
    }

    /* ===============================================
       Procura datas (DD/MM/AAAA)
    =============================================== */
    localizarDatas(texto) {
        return texto.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [];
    }

    /* ===============================================
       Procura telefones
    =============================================== */
    localizarTelefone(texto) {
        const fone = texto.match(/(\(?\d{2}\)?\s?9?\d{4}\-?\d{4})/);
        return fone ? fone[1] : "";
    }

    /* ===============================================
       Extração principal
    =============================================== */
    extrair(textoOriginal) {
        const textoNorm = this.normalizar(textoOriginal);
        const dados = this.novoObjeto();

        // 1. Extração por rótulos flexíveis
        dados.nome = this.extrairCampoRegex(textoOriginal, [
            "criança/adolescente", "criança", "adolescente", "nome da criança", "nome do adolescente", "nome"
        ]);

        dados.responsavel = this.extrairCampoRegex(textoOriginal, [
            "responsável legal", "responsável", "genitora", "genitor", "pai", "mãe"
        ]);

        dados.endereco = this.extrairCampoRegex(textoOriginal, [
            "endereço", "logradouro", "residência"
        ]);

        dados.assunto = this.extrairCampoRegex(textoOriginal, [
            "assunto", "demanda", "motivo"
        ]);

        dados.atendimento = this.extrairCampoRegex(textoOriginal, [
            "tipo de atendimento", "atendimento"
        ]);

        dados.contato = this.extrairCampoRegex(textoOriginal, [
            "contato"
        ]);

        // 2. Extração de Telefone
        dados.telefone = this.localizarTelefone(textoOriginal);
        if (!dados.contato) dados.contato = dados.telefone;

        // 3. Extração Inteligente de Datas
        const datas = this.localizarDatas(textoOriginal);
        if (datas.length > 0) dados.data = datas[0];
        if (datas.length > 1) dados.nascimento = datas[1];

        // Se houver indicação explícita de data de nascimento no texto norm
        if (textoNorm.includes("nascimento") || textoNorm.includes("dt nasc")) {
            const dataNascMatch = this.extrairCampoRegex(textoOriginal, ["data de nascimento", "nascimento", "dt nasc", "data nasc"]);
            if (dataNascMatch) {
                const matchDataNaString = dataNascMatch.match(/\d{2}\/\d{2}\/\d{4}/);
                if (matchDataNaString) dados.nascimento = matchDataNaString[0];
            }
        }

        this.dados = dados;
        console.log("Dados extraídos com sucesso:", dados);
        return dados;
    }
}
