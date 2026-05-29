const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbySVkmJpv2rMkfXvwx8Cxsi_ZRsE2Fd1nCEURnBPiXn3Jy8tKVTT6vj1eB9jU1Gcl9M/exec";
const SENHA_ADMIN = "1234";

let pedidosCarregados = [];
let filtroAtual = "Todos";

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