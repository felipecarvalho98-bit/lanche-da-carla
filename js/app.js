const telefoneLancheCarla = "5585991376278";
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbySVkmJpv2rMkfXvwx8Cxsi_ZRsE2Fd1nCEURnBPiXn3Jy8tKVTT6vj1eB9jU1Gcl9M/exec";

let produtos = [];

let carrinho = [];

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function carregarProdutos(categoria = "todos") {
  const listaProdutos = document.getElementById("listaProdutos");
  listaProdutos.innerHTML = "";

  const produtosFiltrados = categoria === "todos"
    ? produtos
    : produtos.filter(produto => produto.categoria === categoria);

  produtosFiltrados.forEach(produto => {
    const card = document.createElement("div");
    card.className = "produto-card";

    card.innerHTML = `
      <div class="produto-info">
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <span class="preco">${formatarMoeda(produto.preco)}</span>
      </div>

      <button class="btn-adicionar" onclick="adicionarCarrinho(${produto.id})">
        +
      </button>
    `;

    listaProdutos.appendChild(card);
  });
}

function filtrarCategoria(categoria) {
  carregarProdutos(categoria);
}

function adicionarCarrinho(idProduto) {
  const produto = produtos.find(item => item.id === idProduto);

  const itemExistente = carrinho.find(item => item.id === idProduto);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      ...produto,
      quantidade: 1
    });
  }

  atualizarCarrinho();
}

function removerUmaUnidade(idProduto) {
  const item = carrinho.find(produto => produto.id === idProduto);

  if (!item) return;

  item.quantidade -= 1;

  if (item.quantidade <= 0) {
    carrinho = carrinho.filter(produto => produto.id !== idProduto);
  }

  atualizarCarrinho();
}

function adicionarUmaUnidade(idProduto) {
  const item = carrinho.find(produto => produto.id === idProduto);

  if (!item) return;

  item.quantidade += 1;

  atualizarCarrinho();
}

function calcularSubtotal() {
  return carrinho.reduce((total, item) => {
    return total + item.preco * item.quantidade;
  }, 0);
}

function calcularTaxaEntrega() {
  return 0;
}

function atualizarCarrinho() {
  const itensCarrinho = document.getElementById("itensCarrinho");
  const subtotalElemento = document.getElementById("subtotal");
  const taxaElemento = document.getElementById("taxaEntrega");
  const totalElemento = document.getElementById("total");

  itensCarrinho.innerHTML = "";

  if (carrinho.length === 0) {
    itensCarrinho.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio.</p>`;
  }

  carrinho.forEach(item => {
    const div = document.createElement("div");
    div.className = "item-carrinho";

    div.innerHTML = `
      <div>
        <p><strong>${item.nome}</strong></p>
        <p>${item.quantidade} x ${formatarMoeda(item.preco)}</p>
      </div>

      <div class="controles">
        <button onclick="removerUmaUnidade(${item.id})">-</button>
        <span>${item.quantidade}</span>
        <button onclick="adicionarUmaUnidade(${item.id})">+</button>
      </div>
    `;

    itensCarrinho.appendChild(div);
  });

  const subtotal = calcularSubtotal();
  const taxa = calcularTaxaEntrega();
  const total = subtotal + taxa;

  subtotalElemento.textContent = formatarMoeda(subtotal);
  taxaElemento.textContent = formatarMoeda(taxa);
  totalElemento.textContent = formatarMoeda(total);
}

function irParaDadosCliente() {
  if (carrinho.length === 0) {
    alert("Adicione pelo menos um produto ao carrinho.");
    return;
  }

  const dadosCliente = document.getElementById("dadosCliente");
  dadosCliente.classList.remove("escondido");

  dadosCliente.scrollIntoView({
    behavior: "smooth"
  });
}

function mostrarConfirmacao() {
  const telefone = document.getElementById("telefone").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const pagamento = document.getElementById("pagamento").value;
  const observacao = document.getElementById("observacao").value.trim();

  if (!telefone || !nome || !endereco || !pagamento) {
    alert("Preencha telefone, nome, endereço e forma de pagamento.");
    return;
  }

  const subtotal = calcularSubtotal();
  const taxa = calcularTaxaEntrega();
  const total = subtotal + taxa;

  const itensHtml = carrinho.map(item => {
    return `<p>${item.quantidade}x ${item.nome} - ${formatarMoeda(item.preco * item.quantidade)}</p>`;
  }).join("");

  const resumoPedido = document.getElementById("resumoPedido");

  resumoPedido.innerHTML = `
    <p><strong>Cliente:</strong> ${nome}</p>
    <p><strong>Telefone:</strong> ${telefone}</p>
    <p><strong>Endereço:</strong> ${endereco}</p>
    <p><strong>Pagamento:</strong> ${pagamento}</p>

    <hr>

    <h3>Itens</h3>
    ${itensHtml}

    <hr>

    <p><strong>Subtotal:</strong> ${formatarMoeda(subtotal)}</p>
    <p><strong>Taxa de entrega:</strong> ${formatarMoeda(taxa)}</p>
    <p><strong>Total:</strong> ${formatarMoeda(total)}</p>
    <p><strong>Observação:</strong> ${observacao || "Nenhuma"}</p>
  `;

  document.getElementById("modalConfirmacao").classList.remove("escondido");
}

function fecharModal() {
  document.getElementById("modalConfirmacao").classList.add("escondido");
}

function enviarWhatsApp() {
  const telefoneCliente = document.getElementById("telefone").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const pagamento = document.getElementById("pagamento").value;
  const observacao = document.getElementById("observacao").value.trim();

  const subtotal = calcularSubtotal();
  const taxa = calcularTaxaEntrega();
  const total = subtotal + taxa;

  const itensTexto = carrinho.map(item => {
    return `- ${item.quantidade}x ${item.nome} = ${formatarMoeda(item.preco * item.quantidade)}`;
  }).join("\n");

  const mensagem = `
*NOVO PEDIDO - LANCHE DA CARLA*

*Cliente:* ${nome}
*Telefone:* ${telefoneCliente}
*Endereço:* ${endereco}
*Pagamento:* ${pagamento}

*ITENS DO PEDIDO:*
${itensTexto}

*Subtotal:* ${formatarMoeda(subtotal)}
*Taxa de entrega:* ${formatarMoeda(taxa)}
*Total:* ${formatarMoeda(total)}

*Observação:* ${observacao || "Nenhuma"}
  `;

  const url = `https://wa.me/${telefoneLancheCarla}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}

function buscarCliente() {
  const telefone = document.getElementById("telefone").value.trim();
  const mensagemCliente = document.getElementById("mensagemCliente");

  if (!telefone) {
    alert("Digite o telefone para buscar o cadastro.");
    return;
  }

  mensagemCliente.textContent = "Buscando cadastro...";

  // Por enquanto, ainda não estamos ligados ao Google Sheets.
  // Na próxima etapa, essa função vai consultar a planilha.
  setTimeout(() => {
    mensagemCliente.textContent = "Cliente não encontrado. Preencha os dados para novo cadastro.";
    document.getElementById("nome").focus();
  }, 700);
}

function irParaFinalizacao() {
  if (carrinho.length === 0) {
    alert("Adicione pelo menos um produto ao carrinho.");
    return;
  }

  localStorage.setItem("carrinhoLancheCarla", JSON.stringify(carrinho));

  window.location.href = "finalizar.html";
}

async function buscarProdutosDaPlanilha() {
  const listaProdutos = document.getElementById("listaProdutos");

  listaProdutos.innerHTML = "<p>Carregando produtos...</p>";

  try {
    const resposta = await fetch(`${URL_APPS_SCRIPT}?acao=listarProdutos`);
    const dados = await resposta.json();

    if (dados.sucesso && dados.produtos.length > 0) {
      produtos = dados.produtos;
      carregarProdutos();
    } else {
      listaProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
    }

  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    listaProdutos.innerHTML = "<p>Erro ao carregar produtos. Verifique a conexão.</p>";
  }
}

buscarProdutosDaPlanilha();
atualizarCarrinho();