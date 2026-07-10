document.addEventListener("DOMContentLoaded",()=>{


const dados =
JSON.parse(
localStorage.getItem("atendimento_visualizar")
);



if(!dados){

alert("Nenhum atendimento selecionado");

window.history.back();

return;

}



document.getElementById("fData").innerText =
dados.data || "-";


document.getElementById("fNome").innerText =
dados.nome || "-";


document.getElementById("fNascimento").innerText =
dados.nascimento || "-";


document.getElementById("fResponsavel").innerText =
dados.responsavel || "-";


document.getElementById("fContato").innerText =
dados.contato || "-";


document.getElementById("fEndereco").innerText =
dados.endereco || "-";


document.getElementById("fLocalidade").innerText =
dados.localidade || "-";


document.getElementById("fTipo").innerText =
dados.tipo || "-";


document.getElementById("fAssunto").innerText =
dados.assunto || "-";


document.getElementById("fPlantonista").innerText =
dados.plantonista || "-";


document.getElementById("fStatus").innerText =
dados.status || "-";


document.getElementById("fObservacoes").innerText =
dados.observacoes || "-";


});
