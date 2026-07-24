function processarExtracaoPdf(texto) {

    // Normaliza o texto
    texto = texto
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{2,}/g, "\n");

    const linhas = texto
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

    // Sinônimos aceitos
    const campos = {

        nomeCrianca: [
            "criança",
            "criança/adolescente",
            "adolescente",
            "nome",
            "nome da criança",
            "nome do adolescente"
        ],

        dataNascimento: [
            "data de nascimento",
            "nascimento",
            "dt nasc",
            "dt. nasc",
            "data nasc"
        ],

        responsavel: [
            "responsável",
            "responsável legal",
            "genitora",
            "genitor",
            "pai",
            "mãe"
        ],

        endereco: [
            "endereço",
            "logradouro",
            "residência"
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

    // Procura cada linha
    linhas.forEach((linha, indice) => {

        const textoLinha = linha.toLowerCase();

        Object.keys(campos).forEach(campo => {

            if (dados[campo] !== "") return;

            campos[campo].forEach(nomeCampo => {

                if (dados[campo] !== "") return;

                if (textoLinha.startsWith(nomeCampo)) {

                    let valor = linha.substring(nomeCampo.length);

                    valor = valor.replace(/^[:\- ]+/, "").trim();

                    // Caso o valor esteja na linha seguinte
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

    // Procura datas em qualquer parte do documento
    if (!dados.dataNascimento) {

        const datas = texto.match(/\d{2}\/\d{2}\/\d{4}/g);

        if (datas && datas.length > 1)
            dados.dataNascimento = datas[1];

    }

    if (!dados.dataAtendimento) {

        const datas = texto.match(/\d{2}\/\d{2}\/\d{4}/g);

        if (datas && datas.length)
            dados.dataAtendimento = datas[0];

    }

    // Procura telefone
    if (!dados.telefone) {

        const tel = texto.match(/(\(?\d{2}\)?\s?9?\d{4}\-?\d{4})/);

        if (tel)
            dados.telefone = tel[1];

    }

    // Se contato estiver vazio usa telefone
    if (!dados.contato)
        dados.contato = dados.telefone;

    console.log("========== DADOS EXTRAÍDOS ==========");
    console.table(dados);

    // Preenche automaticamente o formulário
    document.getElementById("txtNome")?.value = dados.nomeCrianca;
    document.getElementById("txtDataNascimento")?.value = dados.dataNascimento;
    document.getElementById("txtResponsavel")?.value = dados.responsavel;
    document.getElementById("txtEndereco")?.value = dados.endereco;
    document.getElementById("txtTelefone")?.value = dados.telefone;
    document.getElementById("txtContato")?.value = dados.contato;
    document.getElementById("txtAssunto")?.value = dados.assunto;

    const tipo = document.getElementById("cmbTipoAtendimento");
    if (tipo)
        tipo.value = dados.atendimento;

    const data = document.getElementById("txtData");
    if (data)
        data.value = dados.dataAtendimento;

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
