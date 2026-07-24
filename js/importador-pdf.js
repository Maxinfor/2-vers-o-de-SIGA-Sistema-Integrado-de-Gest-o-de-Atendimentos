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
        // Evento para selecionar arquivo
        document.addEventListener('change', (e) => {
            if (e.target.id === 'inputPdfImport') {
                this.processarArquivo(e.target.files[0]);
            }
        });

        // Evento para botão de importar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btnImportarPdf' || e.target.closest('#btnImportarPdf')) {
                e.preventDefault();
                this.importarPorBotao();
            }
            if (e.target.id === 'btnLimparImportacao' || e.target.closest('#btnLimparImportacao')) {
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
                const textoPagina = conteudo.items.map(item => item.str).join(' ');
                textoCompleto += textoPagina + '\n';
                
                const progresso = 50 + (i / pdf.numPages) * 40;
                this.mostrarProgresso(Math.round(progresso));
                this.mostrarStatus(`📖 Lendo página ${i} de ${pdf.numPages}...`);
            }

            this.mostrarProgresso(90);
            this.mostrarStatus('🔍 Extraindo informações...');

            if (typeof processarExtracaoPdf === 'function') {
                await processarExtracaoPdf(textoCompleto);
                this.mostrarProgresso(100);
                this.mostrarStatus('✅ PDF importado com sucesso!');
            } else {
                console.error('❌ Função processarExtracaoPdf não encontrada!');
                alert('Erro: Função de processamento não encontrada.');
            }

        } catch (erro) {
            console.error('❌ Erro ao processar PDF:', erro);
            alert('❌ Erro ao processar o PDF. Verifique o console.');
            this.mostrarStatus('❌ Erro ao importar PDF');
        }
    }

    async importarPorBotao() {
        const input = document.getElementById('inputPdfImport');
        if (input && input.files && input.files[0]) {
            await this.processarArquivo(input.files[0]);
        } else {
            alert('⚠️ Selecione um arquivo PDF primeiro!');
        }
    }

    mostrarStatus(texto) {
        const el = document.getElementById('statusImportacao');
        if (el) el.innerHTML = texto;
    }

    mostrarProgresso(valor) {
        const barra = document.getElementById('progressoImportacao');
        if (barra) {
            barra.style.display = 'block';
            barra.value = valor;
        }
    }

    limpar() {
        const input = document.getElementById('inputPdfImport');
        if (input) input.value = '';

        this.mostrarStatus('<i class="fa-solid fa-info-circle"></i> Aguardando PDF...');
        const barra = document.getElementById('progressoImportacao');
        if (barra) {
            barra.value = 0;
            barra.style.display = 'none';
        }

        // Limpa campos de visualização
        const camposPdf = [
            'pdfNome', 'pdfNascimento', 'pdfResponsavel', 'pdfEndereco', 
            'pdfTelefone', 'pdfEscola', 'pdfSerie', 'pdfData', 'pdfTipo',
            'pdfAssunto', 'pdfPlantonista', 'pdfProcesso', 'pdfVara', 
            'pdfJuiz', 'pdfPromotor'
        ];
        
        camposPdf.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '—';
        });
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.importadorPDF = new ImportadorPDF();
});

console.log('📄 Importador de PDF carregado!');
