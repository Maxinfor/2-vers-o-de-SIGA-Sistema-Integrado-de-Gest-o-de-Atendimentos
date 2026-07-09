/* =====================================================
   SIGA - Cadastro de Atendimento
   ===================================================== */


// =====================================================
// SALVAR ATENDIMENTO
// =====================================================


function salvarAtendimento(){



let atendimento = {


    id: Date.now(),


    data:
    document.getElementById("data").value
    ||
    new Date().toISOString().split("T")[0],



    hora:
    document.getElementById("hora").value,



    nome:
    document.getElementById("nome").value,



    dataNascimento:
    document.getElementById("dataNascimento").value,



    sexo:
    document.getElementById("sexo").value,



    cpf:
    document.getElementById("cpf").value,



    rg:
    document.getElementById("rg").value,



    responsavel:
    document.getElementById("responsavel").value,



    parentesco:
    document.getElementById("parentesco").value,



    telefone:
    document.getElementById("telefone").value,



    telefone2:
    document.getElementById("telefone2").value,



    endereco:
    document.getElementById("endereco").value,



    numero:
    document.getElementById("numero").value,



    bairro:
    document.getElementById("bairro").value,



    localidade:
    document.getElementById("localidade").value,



    tipo:
    document.getElementById("tipo").value,



    assunto:
    document.getElementById("assunto").value,



    plantonista:
    document.getElementById("plantonista").value,



    observacoes:
    document.getElementById("observacoes").value,



    criadoEm:
    new Date().toISOString()

arquivoPDF:
document.getElementById("arquivoAnexo").files[0]
?
document.getElementById("arquivoAnexo").files[0].name
:
"",
};





// validação simples


if(!atendimento.nome){


alert(
"Informe o nome da criança/adolescente."
);


return;


}



if(!atendimento.responsavel){


alert(
"Informe o responsável."
);


return;


}






// buscar registros existentes


let atendimentos = JSON.parse(

localStorage.getItem(
"siga_atendimentos"
)

) || [];






// adicionar novo registro


atendimentos.push(atendimento);






// salvar


localStorage.setItem(

"siga_atendimentos",

JSON.stringify(atendimentos)

);







alert(
"Atendimento cadastrado com sucesso!"
);







limparFormulario();



}









// =====================================================
// LIMPAR FORMULÁRIO
// =====================================================


function limparFormulario(){



document
.getElementById("formAtendimento")
.reset();



}




// =====================================================
// DATA AUTOMÁTICA
// =====================================================


window.addEventListener(
"DOMContentLoaded",

()=>{


let campoData =
document.getElementById("data");



if(campoData){


campoData.value =
new Date()
.toISOString()
.split("T")[0];


}



let campoHora =
document.getElementById("hora");



if(campoHora){


let agora =
new Date();



campoHora.value =
agora
.toTimeString()
.substring(0,5);



}



});
// =====================================================
// CARREGAR DADOS DO PDF
// =====================================================


window.addEventListener(
"DOMContentLoaded",

()=>{


let dadosPDF =

JSON.parse(

localStorage.getItem(
"siga_pdf_importado"
)

);



if(!dadosPDF)
return;





document.getElementById("nome").value =
dadosPDF.nome || "";



document.getElementById("dataNascimento").value =
dadosPDF.dataNascimento || "";



document.getElementById("responsavel").value =
dadosPDF.responsavel || "";



document.getElementById("telefone").value =
dadosPDF.telefone || "";



document.getElementById("endereco").value =
dadosPDF.endereco || "";



document.getElementById("localidade").value =
dadosPDF.localidade || "";





document.getElementById("tipo").value =
dadosPDF.tipo || "";



document.getElementById("assunto").value =
dadosPDF.assunto || "";





// apagar após carregar

localStorage.removeItem(
"siga_pdf_importado"
);



});
