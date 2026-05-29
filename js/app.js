const telefoneLancheCarla = "5585991376278";

const produtos = [
  {
    id: 1,
    nome: "Pastel queijo",
    categoria: "pasteis",
    descricao: "Pastel tradicional de queijo",
    preco: 6.00
  },
  {
    id: 2,
    nome: "Pastel misto",
    categoria: "pasteis",
    descricao: "Pastel de misto",
    preco: 6.00
  },
  {
    id: 3,
    nome: "Pastel carne",
    categoria: "pasteis",
    descricao: "Pastel de carne",
    preco: 7.00
  },
  {
    id: 4,
    nome: "Pastel carne/queijo",
    categoria: "pasteis",
    descricao: "Pastel de carne com queijo",
    preco: 8.00
  },
  {
    id: 5,
    nome: "Pastel frango",
    categoria: "pasteis",
    descricao: "Pastel de frango",
    preco: 7.00
  },
  {
    id: 6,
    nome: "Pastel frango/queijo",
    categoria: "pasteis",
    descricao: "Pastel de frango com queijo",
    preco: 8.00
  },
  {
    id: 7,
    nome: "Pastel calabresa",
    categoria: "pasteis",
    descricao: "Pastel de calabresa",
    preco: 7.00
  },
  {
    id: 8,
    nome: "Pastel fran/calabresa",
    categoria: "pasteis",
    descricao: "Pastel de frango com calabresa",
    preco: 8.00
  },
  {
    id: 9,
    nome: "Pastel calabresa/queijo",
    categoria: "pasteis",
    descricao: "Pastel de calabresa com queijo",
    preco: 8.00
  },
  {
    id: 10,
    nome: "Pastel mistão",
    categoria: "pasteis",
    descricao: "Pastel especial mistão",
    preco: 15.00
  },
  {
    id: 11,
    nome: "Batata M",
    categoria: "pasteis",
    descricao: "Batata tamanho médio",
    preco: 8.00
  },
  {
    id: 12,
    nome: "Batata G",
    categoria: "pasteis",
    descricao: "Batata tamanho grande",
    preco: 10.00
  },
  {
    id: 13,
    nome: "Creme galinha M",
    categoria: "pratinhos",
    descricao: "Creme de galinha médio",
    preco: 12.00
  },
  {
    id: 14,
    nome: "Creme galinha G",
    categoria: "pratinhos",
    descricao: "Creme de galinha grande",
    preco: 15.00
  },
  {
    id: 15,
    nome: "Caldo carne moída",
    categoria: "pratinhos",
    descricao: "Caldo de carne moída",
    preco: 5.00
  },
  {
    id: 16,
    nome: "Coca lata",
    categoria: "bebidas",
    descricao: "Refrigerante lata",
    preco: 4.00
  },
  {
    id: 17,
    nome: "Coca pequena",
    categoria: "bebidas",
    descricao: "Coca-Cola pequena",
    preco: 3.50
  },
  {
    id: 18,
    nome: "Coca 600",
    categoria: "bebidas",
    descricao: "Coca-Cola 600ml",
    preco: 7.00
  },
  {
    id: 19,
    nome: "Refri",
    categoria: "bebidas",
    descricao: "Refrigerante",
    preco: 2.50
  },
  {
    id: 20,
    nome: "Suco",
    categoria: "bebidas",
    descricao: "Suco",
    preco: 3.50
  }
];

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

carregarProdutos();
atualizarCarrinho();