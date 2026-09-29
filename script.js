/* =========================================================
   script.js - Comportamento e Banco de Dados do Navegador
   ========================================================= */

// Nome da gaveta de memória no navegador
const CHAVE = "aprendeMaisPortugues-dados";

// Elementos da interface
const formulario = document.getElementById("formulario");
const listaEl    = document.getElementById("lista");
const painel     = document.getElementById("painel");
const busca      = document.getElementById("busca");
const filtro     = document.getElementById("filtro");
const aviso      = document.getElementById("aviso");

/* 1. LER registros */
function lerFichas() {
  const texto = localStorage.getItem(CHAVE);
  if (!texto) return [];
  try { return JSON.parse(texto); } catch (erro) { return []; }
}

/* 2. GRAVAR registros */
function gravarFichas(fichas) {
  localStorage.setItem(CHAVE, JSON.stringify(fichas));
}

/* 3. Evitar scripts maliciosos */
function escapar(texto) {
  const caixa = document.createElement("div");
  caixa.textContent = texto;
  return caixa.innerHTML;
}

/* 4. MOSTRAR os cartões no mural */
function mostrar() {
  const fichas = lerFichas();
  const termo = busca.value.trim().toLowerCase();
  const escolhida = filtro.value;

  const visiveis = fichas.filter(function(f) {
    const passaFiltro = (escolhida === "todas") || (f.nivelModulo === escolhida);
    const textoTodo = Object.values(f).join(" ").toLowerCase();
    const passaBusca = (termo === "") || (textoTodo.indexOf(termo) >= 0);
    return passaFiltro && passaBusca;
  });

  listaEl.innerHTML = "";

  if (visiveis.length === 0) {
    listaEl.innerHTML = '<p class="vazio">Nenhum registro de progresso encontrado. Cadastre uma aula acima!</p>';
    desenharPainel(fichas);
    return;
  }

  visiveis.forEach(function(f) {
    const cartao = document.createElement("article");
    cartao.className = "cartao";
    cartao.setAttribute("data-nivel", f.nivelModulo);
    
    let html = "";
    html += "<h3>" + escapar(f.nomeAluno) + "</h3>";
    html += '<span class="etiqueta">' + escapar(f.nivelModulo) + "</span>";
    html += "<p><b>Exercício:</b> " + escapar(f.exercicioRealizado) + "</p>";
    html += "<p><b>Desempenho:</b> ⭐ " + escapar(f.pontuacao) + " / 10</p>";
    html += "<p><b>Observações:</b> " + escapar(f.observacoes) + "</p>";
    html += '<footer><small>' + escapar(f.data) + '</small>' +
            '<button type="button" class="apagar" data-id="' + f.id + '">Apagar</button></footer>';
    
    cartao.innerHTML = html;
    listaEl.appendChild(cartao);
  });

  desenharPainel(fichas);
}

/* 5. PAINEL DE NÚMEROS (Cálculos automáticos) */
function desenharPainel(fichas) {
  let html = "";
  html += '<div class="numero"><b>' + fichas.length + "</b><span>exercícios registrados</span></div>";
  
  const somaPontos = fichas.reduce(function(acc, f) { return acc + Number(f.pontuacao || 0); }, 0);
  const media = fichas.length > 0 ? (somaPontos / fichas.length).toFixed(1) : 0;
  html += '<div class="numero"><b>⭐ ' + media + "</b><span>média de aproveitamento</span></div>";

  const porModulo = {};
  fichas.forEach(function(f) { porModulo[f.nivelModulo] = (porModulo[f.nivelModulo] || 0) + 1; });
  
  Object.keys(porModulo).forEach(function(nome) {
    html += '<div class="numero pequeno"><b>' + porModulo[nome] + "</b><span>no módulo " + escapar(nome) + "</span></div>";
  });
  
  painel.innerHTML = html;
}

/* 6. SALVAR novo registro */
formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const nova = {
    id: Date.now(),
    nomeAluno: document.getElementById("nomeAluno").value.trim(),
    nivelModulo: document.getElementById("nivelModulo").value.trim(),
    exercicioRealizado: document.getElementById("exercicioRealizado").value.trim(),
    pontuacao: Number(document.getElementById("pontuacao").value),
    observacoes: document.getElementById("observacoes").value.trim(),
    data: new Date().toLocaleDateString("pt-BR")
  };

  const fichas = lerFichas();
  fichas.unshift(nova);
  gravarFichas(fichas);

  formulario.reset();
  mostrar();
  aviso.textContent = "Progresso registrado com sucesso!";
  setTimeout(function() { aviso.textContent = ""; }, 4000);
});

/* 7. APAGAR registro único */
listaEl.addEventListener("click", function(evento) {
  if (!evento.target.classList.contains("apagar")) return;
  const id = Number(evento.target.getAttribute("data-id"));
  const fichas = lerFichas().filter(function(f) { return f.id !== id; });
  gravarFichas(fichas);
  mostrar();
});

/* 8. PESQUISA E FILTROS */
busca.addEventListener("input", mostrar);
filtro.addEventListener("change", mostrar);

document.getElementById("limpar").addEventListener("click", function() {
  if (confirm("Apagar todos os registros salvos neste navegador?")) {
    localStorage.removeItem(CHAVE);
    mostrar();
  }
});

/* 9. EXPORTAR E IMPORTAR DADOS (Backup) */
document.getElementById("exportar").addEventListener("click", function() {
  const texto = JSON.stringify(lerFichas(), null, 2);
  const arquivo = new Blob([texto], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = "dados-alfabetizacao.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById("importar").addEventListener("change", function(evento) {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = function() {
    try {
      const recebidas = JSON.parse(leitor.result);
      if (!Array.isArray(recebidas)) throw new Error("Formato inválido");
      gravarFichas(recebidas.concat(lerFichas()));
      mostrar();
      aviso.textContent = recebidas.length + " registros carregados.";
    } catch (erro) {
      aviso.textContent = "Arquivo JSON de backup inválido.";
    }
  };
  leitor.readAsText(arquivo);
});

/* 10. Carregar dados ao abrir */
mostrar();