// ==========================================
// SIGA - Pesquisa de Atendimentos
// ==========================================


// Carregar banco

let atendimentos = JSON.parse(

localStorage.getItem("siga_atendimentos")

) || [];





// ==========================================
// CARREGAR TABELA
// ==========================================


function carregarTabela(lista = atendimentos){


let tabela = document.getElementById("lista");


tabela.innerHTML = "";



lista.forEach((item,index)=>{


tabela.innerHTML += `


<tr>


<td>
${item.data || ""}
</td>


<td>
${item.nome || ""}
</td>


<td>
${item.responsavel || ""}
</td>


<td>
${item.localidade || ""}
</td>


<td>
${item.tipo || ""}
</td>


<td>
${item.plantonista || ""}
</td>



<td>


<button class="ver"
onclick="visualizar(${index})">

<i class="fa-solid fa-eye"></i>

</button>



<button class="excluir"
onclick="excluir(${index})">

<i class="fa-solid fa-trash"></i>

</button>


</td>



</tr>


`;



});


}







// ==========================================
// PESQUISA
// ==========================================


function pesquisar(){



let texto =

document.getElementById("busca")
.value
.toLowerCase();




let tipo =

document.getElementById("filtroTipo")
.value;





let local =

document.getElementById("filtroLocal")
.value;







let resultado = atendimentos.filter(item=>{


return (


(item.nome || "")
.toLowerCase()
.includes(texto)



&&



(tipo === "" ||
item.tipo === tipo)



&&



(local === "" ||
item.localidade === local)



);



});




carregarTabela(resultado);



}








// ==========================================
// VISUALIZAR
// ==========================================


function visualizar(index){


let item = atendimentos[index];



alert(`

Nome:
${item.nome}


Data:
${item.data}


Nascimento:
${item.nascimento}


Responsável:
${item.responsavel}


Endereço:
${item.endereco}


Localidade:
${item.localidade}


Contato:
${item.contato}


Assunto:
${item.assunto}


Tipo:
${item.tipo}


Plantonista:
${item.plantonista}


Observações:
${item.observacoes}


Usuário:
${item.usuario}

`);


}







// ==========================================
// EXCLUIR
// ==========================================


function excluir(index){



let confirmar = confirm(

"Deseja excluir este atendimento?"

);



if(confirmar){



atendimentos.splice(index,1);



localStorage.setItem(

"siga_atendimentos",

JSON.stringify(atendimentos)

);



carregarTabela();



}



}








// Inicializar

carregarTabela();
