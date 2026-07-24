/* ==========================================================
   SIGACTPAR
   MOTOR DE EXTRAÇÃO INTELIGENTE
========================================================== */

class ExtratorPDF {

    constructor() {

        this.dados = {};

    }

    /* ===============================================
       Normalização
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
       Localiza um campo
    =============================================== */

    localizarCampo(texto, palavras) {

        const linhas = texto.split("\n");

        for (let i = 0; i < linhas.length; i++) {

            const linhaOriginal = linhas[i];

            const linha = this.normalizar(linhaOriginal);

            for (const palavra of palavras) {

                if (linha.startsWith(palavra)) {

                    let valor = linhaOriginal
                        .substring(palavra.length)
                        .replace(/^[:\- ]+/, "")
                        .trim();

                    if (!valor && linhas[i + 1]) {

                        valor = linhas[i + 1].trim();

                    }

                    if (valor)
                        return valor;

                }

            }

        }

        return "";

    }

    /* ===============================================
       Procura datas
    =============================================== */

    localizarDatas(texto) {

        return texto.match(/\d{2}\/\d{2}\/\d{4}/g) || [];

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

        const texto = this.normalizar(textoOriginal);

        const dados = this.novoObjeto();

        dados.nome = this.localizarCampo(textoOriginal, [

            "criança",

            "criança/adolescente",

            "adolescente",

            "nome",

            "nome da criança",

            "nome do adolescente"

        ]);

        dados.responsavel = this.localizarCampo(textoOriginal, [

            "responsável",

            "responsável legal",

            "genitor",

            "genitora",

            "pai",

            "mãe"

        ]);

        dados.endereco = this.localizarCampo(textoOriginal, [

            "endereço",

            "logradouro",

            "residência"

        ]);

        dados.assunto = this.localizarCampo(textoOriginal, [

            "assunto",

            "demanda",

            "motivo"

        ]);

        dados.atendimento = this.localizarCampo(textoOriginal, [

            "tipo de atendimento",

            "atendimento"

        ]);

        dados.contato = this.localizarCampo(textoOriginal, [

            "contato"

        ]);

        dados.telefone = this.localizarTelefone(textoOriginal);

        const datas = this.localizarDatas(textoOriginal);

        if (datas.length > 0)
            dados.data = datas[0];

        if (datas.length > 1)
            dados.nascimento = datas[1];

        this.dados = dados;

        return dados;

    }

}
