/* ==========================================================
   SIGACTPAR - IMPORTADOR DE PDF
========================================================== */

class ImportadorPDF {
    constructor() {
        this.iniciar();
    }

    async iniciar() {
        await this.carregarBiblioteca();
        this.eventos();
        console.log("📄 Importador de PDF pronto!");
    }

    carregarBiblioteca() {
        return new Promise((resolve, reject) => {
            if (window.pdfjsLib) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    eventos() {
        document.addEventListener('change', (e) => {
            if (e.target.id === 'inputPdfImport') {
                this.processarArquivo(e.target.files[0]);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.id === 'btnImportarPdf' || e.target.closest('#btnImportarPdf')) {
                this.importarPorBotao();
            }
            if (e.target.id === 'btnLimparImportacao') {
                this.limpar();
            }
        });
    }

    async processarArquivo(arquivo) {
        if (!arquivo) return;
        
        console.log(`📄 Processando: ${arquivo.name}`);
        this.mostrarStatus('📖 Lendo PDF...');
        this.mostrarProgresso(10);

        try {
            const buffer = await arquivo.arrayBuffer();
            this.mostrarProgresso(30);

            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            this.mostrarProgresso(50);

            let textoCompleto = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const pagina = await pdf.getPage(i);
                const conteudo = await pagina.getTextContent();
               
