const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbySVkmJpv2rMkfXvwx8Cxsi_ZRsE2Fd1nCEURnBPiXn3Jy8tKVTT6vj1eB9jU1Gcl9M/exec";
const SENHA_ADMIN = "1234";

let pedidosCarregados = [];
let filtroAtual = "Todos";
let abaAtual = "pedidos";
let produtosAdmin = [];

function formatarMoeda(valor) {
  const numero = Number(valor) || 0;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(dataRecebida) {
  if (!dataRecebida) return "Sem data";

  const data = new Date(dataRecebida);

  if (isNaN(data.getTime())) {
    return dataRecebida;
  }

  return data.toLocaleString("pt-BR");
}

function entrarAdmin() {
  const senhaDigitada = document.getElementById("senhaAdmin").value;
  const mensagemLogin = document.getElementById("mensagemLogin");

  if (senhaDigitada === SENHA_ADMIN) {
    localStorage.setItem("adminLancheCarlaLogado", "sim");

    document.getElementById("loginAdmin").classList.add("escondido");
    document.getElementById("painelAdmin").classList.remove("escondido");

    carregarPedidos();
  } else {
    mensagemLogin.textContent = "Senha incorreta.";
  }
}

function mostrarAbaPedidos() {
  abaAtual = "pedidos";

  document.getElementById("tituloAdmin").textContent = "Pedidos recebidos";
  document.getElementById("abaPedidos").classList.remove("escondido");
  document.getElementById("abaProdutos").classList.add("escondido");

  carregarPedidos();
}

function mostrarAbaProdutos() {
  abaAtual = "produtos";

  document.getElementById("tituloAdmin").textContent = "Produtos cadastrados";
  document.getElementById("abaPedidos").classList.add("escondido");
  document.getElementById("abaProdutos").classList.remove("escondido");

  carregarProdutosAdmin();
}

function atualizarAbaAtual() {
  if (abaAtual === "pedidos") {
    carregarPedidos();
  } else {
    carregarProdutosAdmin();
  }
}

async function carregarProdutosAdmin() {
  const lista = document.getElementById("listaProdutosAdmin");
  const mensagem = document.getElementById("mensagemProdutos");

  lista.innerHTML = "";
  mensagem.textContent = "Carregando produtos...";

  try {
    const resposta = await fetch(`${URL_APPS_SCRIPT}?acao=listarProdutosAdmin`);
    const dados = await resposta.json();

    if (!dados.sucesso) {
      mensagem.textContent = "Erro ao carregar produtos.";
      return;
    }

    produtosAdmin = dados.produtos || [];

    if (produtosAdmin.length === 0) {
      mensagem.textContent = "Nenhum produto cadastrado.";
      return;
    }

    mensagem.textContent = "";

    produtosAdmin.forEach(produto => {
      const card = document.createElement("div");
      card.className = "produto-admin-card";

      card.innerHTML = `
        <div>
          <h3>${produto.nome}</h3>
          <p><strong>Categoria:</strong> ${produto.categoria}</p>
          <p><strong>Descrição:</strong> ${produto.descricao}</p>
          <p><strong>Preço:</strong> ${formatarMoeda(produto.preco)}</p>
          <p><strong>Ativo:</strong> ${produto.ativo}</p>
        </div>

        <button class="btn-editar-produto" onclick="editarProdutoAdmin('${produto.id}')">
          Editar
        </button>
      `;

      lista.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    mensagem.textContent = "Erro ao carregar produtos. Verifique a conexão.";
  }
}

function editarProdutoAdmin(idProduto) {
  const produto = produtosAdmin.find(item => String(item.id) === String(idProduto));

  if (!produto) {
    alert("Produto não encontrado.");
    return;
  }

  document.getElementById("produtoId").value = produto.id;
  document.getElementById("produtoNome").value = produto.nome;
  document.getElementById("produtoCategoria").value = produto.categoria;
  document.getElementById("produtoDescricao").value = produto.descricao;
  document.getElementById("produtoPreco").value = produto.preco;
  document.getElementById("produtoAtivo").value = produto.ativo;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function salvarProdutoAdmin() {
  const id = document.getElementById("produtoId").value.trim();
  const nome = document.getElementById("produtoNome").value.trim();
  const categoria = document.getElementById("produtoCategoria").value;
  const descricao = document.getElementById("produtoDescricao").value.trim();
  const preco = document.getElementById("produtoPreco").value;
  const ativo = document.getElementById("produtoAtivo").value;

  if (!nome || !categoria || !descricao || !preco) {
    alert("Preencha nome, categoria, descrição e preço.");
    return;
  }

  const produto = {
    acao: "salvarProduto",
    id: id,
    nome: nome,
    categoria: categoria,
    descricao: descricao,
    preco: Number(preco),
    ativo: ativo
  };

  try {
    const resposta = await fetch(URL_APPS_SCRIPT, {
      method: "POST",
      body: JSON.stringify(produto)
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      alert(dados.mensagem);
      limparFormularioProduto();
      carregarProdutosAdmin();
    } else {
      alert("Erro ao salvar produto.");
    }

  } catch (erro) {
    console.error("Erro ao salvar produto:", erro);
    alert("Erro ao salvar produto. Verifique a conexão.");
  }
}

function limparFormularioProduto() {
  document.getElementById("produtoId").value = "";
  document.getElementById("produtoNome").value = "";
  document.getElementById("produtoCategoria").value = "pasteis";
  document.getElementById("produtoDescricao").value = "";
  document.getElementById("produtoPreco").value = "";
  document.getElementById("produtoAtivo").value = "sim";
}

function verificarLoginAdmin() {
  const logado = localStorage.getItem("adminLancheCarlaLogado");

  if (logado === "sim") {
    document.getElementById("loginAdmin").classList.add("escondido");
    document.getElementById("painelAdmin").classList.remove("escondido");

    carregarPedidos();
  }
}

async function carregarPedidos() {
  const lista = document.getElementById("listaPedidosAdmin");
  const mensagem = document.getElementById("mensagemAdmin");

  lista.innerHTML = "";
  mensagem.textContent = "Carregando pedidos...";

  try {
    const resposta = await fetch(`${URL_APPS_SCRIPT}?acao=listarPedidos`);
    const dados = await resposta.json();

    if (!dados.sucesso) {
      mensagem.textContent = "Erro ao carregar pedidos.";
      return;
    }

    if (!dados.pedidos || dados.pedidos.length === 0) {
      mensagem.textContent = "Nenhum pedido encontrado.";
      return;
    }

    pedidosCarregados = dados.pedidos.reverse();

    mostrarPedidosNaTela();

  } catch (erro) {
    console.error("Erro ao carregar pedidos:", erro);
    mensagem.textContent = "Erro ao carregar pedidos. Verifique a internet ou a URL do Apps Script.";
  }
}

function mostrarPedidosNaTela() {
  const lista = document.getElementById("listaPedidosAdmin");
  const mensagem = document.getElementById("mensagemAdmin");

  lista.innerHTML = "";

  let pedidosFiltrados = pedidosCarregados;

  if (filtroAtual !== "Todos") {
    pedidosFiltrados = pedidosCarregados.filter(pedido => pedido.status === filtroAtual);
  }

  if (pedidosFiltrados.length === 0) {
    mensagem.textContent = "Nenhum pedido encontrado para este filtro.";
    return;
  }

  mensagem.textContent = "";

  pedidosFiltrados.forEach(pedido => {
    const card = document.createElement("div");
    card.className = "pedido-card";

    card.innerHTML = `
      <div class="pedido-topo">
        <div>
          <h3>${pedido.idPedido}</h3>
          <p>${formatarData(pedido.dataHora)}</p>
        </div>

        <span class="status status-${normalizarStatus(pedido.status)}">
          ${pedido.status}
        </span>
      </div>

      <div class="pedido-info">
        <p><strong>Cliente:</strong> ${pedido.nome}</p>
        <p><strong>Telefone:</strong> ${pedido.telefone}</p>
        <p><strong>Endereço:</strong> ${pedido.endereco}</p>
        <p><strong>Pagamento:</strong> ${pedido.pagamento}</p>
      </div>

      <div class="pedido-itens">
        <h4>Itens</h4>
        <pre>${pedido.itens}</pre>
      </div>

      <div class="pedido-total">
        <p><strong>Subtotal:</strong> ${formatarMoeda(pedido.subtotal)}</p>
        <p><strong>Taxa:</strong> ${formatarMoeda(pedido.taxaEntrega)}</p>
        <p><strong>Total:</strong> ${formatarMoeda(pedido.total)}</p>
      </div>

      <div class="pedido-observacao">
        <p><strong>Observação:</strong> ${pedido.observacao || "Nenhuma"}</p>
      </div>

      <div class="pedido-acoes">
        <label>Status do pedido</label>

        <select onchange="alterarStatusPedido('${pedido.idPedido}', this.value)">
          <option value="Novo" ${pedido.status === "Novo" ? "selected" : ""}>Novo</option>
          <option value="Preparando" ${pedido.status === "Preparando" ? "selected" : ""}>Preparando</option>
          <option value="Saiu para entrega" ${pedido.status === "Saiu para entrega" ? "selected" : ""}>Saiu para entrega</option>
          <option value="Concluído" ${pedido.status === "Concluído" ? "selected" : ""}>Concluído</option>
          <option value="Cancelado" ${pedido.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
        </select>

        <a class="btn-whatsapp-admin" href="https://wa.me/55${pedido.telefone}" target="_blank">
          Chamar cliente no WhatsApp
        </a>

        <button class="btn-aviso-entrega" onclick="avisarClienteEntrega('${pedido.telefone}', '${pedido.nome}', '${pedido.idPedido}')">
          Avisar que saiu para entrega
        </button>
      </div>
    `;

    lista.appendChild(card);
  });
}

function filtrarPedidos(status) {
  filtroAtual = status;
  mostrarPedidosNaTela();
}

async function alterarStatusPedido(idPedido, novoStatus) {
  const confirmar = confirm(`Alterar status do pedido para "${novoStatus}"?`);

  if (!confirmar) {
    carregarPedidos();
    return;
  }

  try {
    const resposta = await fetch(URL_APPS_SCRIPT, {
      method: "POST",
      body: JSON.stringify({
        acao: "alterarStatus",
        idPedido: idPedido,
        status: novoStatus
      })
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      alert("Status alterado com sucesso!");
      carregarPedidos();
    } else {
      alert("Erro ao alterar status.");
    }

  } catch (erro) {
    console.error("Erro ao alterar status:", erro);
    alert("Erro ao alterar status. Verifique a conexão.");
  }
}

function avisarClienteEntrega(telefone, nome, idPedido) {
  const telefoneLimpo = String(telefone).replace(/\D/g, "");

  const mensagem = `
Olá, ${nome}! 😊

Seu pedido do *Lanche da Carla* saiu para entrega.

*Pedido:* ${idPedido}

O entregador já está a caminho. 🍴
Obrigado pela preferência!
  `;

  const url = `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}

function normalizarStatus(status) {
  if (!status) return "novo";

  return status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function sairAdmin() {
  localStorage.removeItem("adminLancheCarlaLogado");

  document.getElementById("painelAdmin").classList.add("escondido");
  document.getElementById("loginAdmin").classList.remove("escondido");

  document.getElementById("senhaAdmin").value = "";
  document.getElementById("mensagemLogin").textContent = "";

  document.getElementById("senhaAdmin").focus();
}

verificarLoginAdmin();