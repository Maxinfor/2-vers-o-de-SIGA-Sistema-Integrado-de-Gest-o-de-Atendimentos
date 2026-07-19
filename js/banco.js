/* ==========================================================
   SIGACTPAR
   BANCO DE DADOS LOCAL
========================================================== */

const Banco = {

    chave: "SIGACTPAR",

    dados: {

        atendimentos: [],
        criancas: [],
        responsaveis: [],
        processos: [],
        agenda: [],
        veiculos: [],
        patrimonio: []

    }

};

/* ==========================================================
   INICIALIZA
========================================================== */

function iniciarBanco(){

    const banco = localStorage.getItem(Banco.chave);

    if(banco){

        Banco.dados = JSON.parse(banco);

    }else{

        salvarBanco();

    }

}

/* ==========================================================
   SALVAR
========================================================== */

function salvarBanco(){

    localStorage.setItem(

        Banco.chave,

        JSON.stringify(Banco.dados)

    );

}

/* ==========================================================
   LIMPAR
========================================================== */

function limparBanco(){

    localStorage.removeItem(Banco.chave);

    iniciarBanco();

}
