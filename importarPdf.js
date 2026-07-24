/* ==========================================================
   SIGACTPAR
   IMPORTAÇÃO INTELIGENTE DE PDF
========================================================== */

class ImportadorPDF {

    constructor() {

        this.pdf = null;
        this.texto = "";
        this.arquivo = null;

        this.iniciar();

    }

    /* ========================================= */

    async iniciar() {

        await this.carregarBiblioteca();

        this.eventos();

    }

    /* ========================================= */

    carregarBiblioteca() {

        return new Promise((resolve, reject) => {

            if (window.pdfjsLib) {

                pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                resolve();

                return;

            }

            const script = document.createElement("script");

            script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

            script.onload = () => {

                pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                resolve();

            };

            script.onerror = reject;

            document.head.appendChild(script);

        });

    }

    /* ========================================= */

    eventos() {

        document.addEventListener("change", e => {

            if (e.target.id === "inputPdfImport") {

                this.importar(e.target.files[0]);

            }

        });

        document.addEventListener("click", e => {

            if (e.target.id === "btnLimparImportacao") {

                this.limpar();

            }

        });

    }

    /* ========================================= */

    status(texto) {

        const div = document.getElementById("statusImportacao");

        if(div)
            div.innerHTML = texto;

    }

    barra(valor){

        const barra = document.getElementById("progressoImportacao");

        if(!barra)
            return;

        barra.style.display="block";

        barra.value = valor;

    }

    /* ========================================= */

    async importar(arquivo){

        if(!arquivo)
            return;

        this.arquivo = arquivo;

        this.status("Abrindo documento...");

        this.barra(5);

        try{

            const buffer = await arquivo.arrayBuffer();

            const loading =
            pdfjsLib.getDocument({
                data:buffer
            });

            const pdf =
            await loading.promise;

            this.texto="";

            for(let i=1;i<=pdf.numPages;i++){

                this.status(
                    `Lendo página ${i} de ${pdf.numPages}`
                );

                const pagina =
                await pdf.getPage(i);

                const conteudo =
                await pagina.getTextContent();

                const textoPagina =
                conteudo.items
                .map(x=>x.str)
                .join(" ");

                this.texto +=
                textoPagina + "\n";

                this.barra(
                    Math.round((i/pdf.numPages)*100)
                );

            }

            this.status("Extraindo informações...");

            if(typeof processarExtracaoPdf==="function"){

                processarExtracaoPdf(this.texto);

            }

        }

        catch(erro){

            console.error(erro);

            alert("Erro ao abrir PDF.");

        }

    }

    /* ========================================= */

    limpar(){

        const input =
        document.getElementById("inputPdfImport");

        if(input)
            input.value="";

        this.status("");

        const barra =
        document.getElementById("progressoImportacao");

        if(barra){

            barra.value=0;

            barra.style.display="none";

        }

        [
            "pdfNome",
            "pdfNascimento",
            "pdfResponsavel",
            "pdfEndereco",
            "pdfTelefone",
            "pdfContato",
            "pdfAssunto",
            "pdfTipo",
            "pdfData"
        ].forEach(id=>{

            const campo =
            document.getElementById(id);

            if(campo)
                campo.innerHTML="—";

        });

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    window.importadorPDF =
    new ImportadorPDF();

});
