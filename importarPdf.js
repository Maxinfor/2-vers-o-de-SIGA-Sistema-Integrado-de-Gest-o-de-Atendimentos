/* ==========================================================
   SIGACTPAR
   IMPORTADOR DE PDF
   Parte 1
========================================================== */

class ImportadorPDF {

    constructor() {

        this.pdfjs = null;
        this.arquivo = null;
        this.textoCompleto = "";
        this.totalPaginas = 0;

        this.inicializar();

    }

    /* ==============================================
       Inicialização
    ============================================== */

    async inicializar() {

        await this.carregarPdfJs();

        this.configurarEventos();

        console.log("Importador PDF iniciado.");

    }

    /* ==============================================
       Carrega PDF.js
    ============================================== */

    carregarPdfJs() {

        return new Promise((resolve, reject) => {

            if (window.pdfjsLib) {

                this.pdfjs = window.pdfjsLib;

                this.pdfjs.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                resolve();

                return;

            }

            const script = document.createElement("script");

            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

            script.onload = () => {

                this.pdfjs = window.pdfjsLib;

                this.pdfjs.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                resolve();

            };

            script.onerror = reject;

            document.head.appendChild(script);

        });

    }

    /* ==============================================
       Eventos
    ============================================== */

    configurarEventos() {

        document.addEventListener("change", (e) => {

            if (e.target.id === "inputPdfImport") {

                this.selecionarArquivo(e.target.files[0]);

            }

        });

    }

    /* ==============================================
       Seleção do arquivo
    ============================================== */

    async selecionarArquivo(arquivo) {

        if (!arquivo)
            return;

        if (arquivo.type !== "application/pdf") {

            alert("Selecione um arquivo PDF.");

            return;

        }

        this.arquivo = arquivo;

        await this.lerPdf();

    }

    /* ==============================================
       Atualiza status
    ============================================== */

    atualizarStatus(texto) {

        const status =
            document.getElementById("statusImportacao");

        if (status)
            status.innerHTML = texto;

        console.log(texto);

    }

    atualizarBarra(valor) {

        const barra =
            document.getElementById("progressoImportacao");

        if (!barra)
            return;

        barra.style.display = "block";

        barra.value = valor;

    }

    /* ==============================================
       Leitura completa
    ============================================== */

    async lerPdf() {

        this.textoCompleto = "";

        this.atualizarStatus("Abrindo PDF...");

        this.atualizarBarra(5);

        try {

            const buffer =
                await this.arquivo.arrayBuffer();

            const loading =
                this.pdfjs.getDocument({
                    data: buffer
                });

            const pdf =
                await loading.promise;

            this.totalPaginas = pdf.numPages;

            this.atualizarStatus(
                `Documento possui ${this.totalPaginas} página(s).`
            );

            for (let pagina = 1; pagina <= pdf.numPages; pagina++) {

                this.atualizarStatus(
                    `Lendo página ${pagina} de ${pdf.numPages}...`
                );

                const page =
                    await pdf.getPage(pagina);

                const conteudo =
                    await page.getTextContent();

                const textoPagina =
                    conteudo.items
                        .map(item => item.str)
                        .join(" ");

                this.textoCompleto +=
                    textoPagina + "\n";

                const porcentagem =
                    Math.round(
                        (pagina / pdf.numPages) * 100
                    );

                this.atualizarBarra(porcentagem);

            }

            this.atualizarStatus(
                "PDF carregado com sucesso."
            );

            console.log(this.textoCompleto);

            /* ================================
               Chama o extrator inteligente
            ================================ */

            if (typeof processarExtracaoPdf === "function") {

                processarExtracaoPdf(
                    this.textoCompleto
                );

            } else {

                console.warn(
                    "Função processarExtracaoPdf não encontrada."
                );

            }

        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao ler o PDF."
            );

        }

    }

}

/* ======================================================
   Inicialização automática
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    window.importadorPDF =
        new ImportadorPDF();

});
