/* ==========================================================
   SIGACTPAR
   CONFIGURAÇÕES DO SISTEMA
========================================================== */

const CONFIG = {

    /* ======================================================
       SISTEMA
    ====================================================== */

    sistema: "SIGACTPAR",

    nomeCompleto:

        "Sistema Integrado de Gestão de Atendimentos",

    orgao:

        "Conselho Tutelar do Paranoá",

    versao: "1.0.0",

    ambiente: "Produção",

    /* ======================================================
       INTERFACE
    ====================================================== */

    tema: "light",

    idioma: "pt-BR",

    registrosPorPagina: 15,

    paginaInicial: "dashboard",

    animacoes: true,

    /* ======================================================
       FORMATAÇÃO
    ====================================================== */

    formatoData: "dd/MM/yyyy",

    formatoHora: "HH:mm",

    formatoDataHora: "dd/MM/yyyy HH:mm",

    moeda: "BRL",

    /* ======================================================
       DASHBOARD
    ====================================================== */

    dashboard:{

        atualizarAutomaticamente:true,

        intervaloAtualizacao:60000,

        mostrarGraficos:true,

        mostrarAgenda:true,

        mostrarPendencias:true

    },

    /* ======================================================
       BACKUP
    ====================================================== */

    backup:{

        automatico:false,

        quantidadeMaxima:20

    }

};
