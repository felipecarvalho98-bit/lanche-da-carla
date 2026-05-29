const telefoneLancheCarla = "5585991376278";
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbySVkmJpv2rMkfXvwx8Cxsi_ZRsE2Fd1nCEURnBPiXn3Jy8tKVTT6vj1eB9jU1Gcl9M/exec";

let carrinhoFinal = [];

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function carregarCarrinhoFinal() {
  const carrinhoSalvo = localStorage.getItem("carrinhoLancheCarla");

  if (!carrinhoSalvo) {
    alert("Nenhum produto encontrado no carrinho.");
    window.location.href = "index.html";
    return;
  }

  carrinhoFinal = JSON.parse(carrinhoSalvo);

  if (carrinhoFinal.length === 0) {
    alert("Seu carrinho está vazio.");
    window.location.href = "index.html";
    return;
  }

  atualizarResumoFinal();
}

function calcularSubtotal() {
  return carrinhoFinal.reduce((total, item) => {
    return total + item.preco * item.quantidade;
  }, 0);
}

function calcularTaxaEntrega() {
  return 0;
}

function atualizarResumoFinal() {
  const resumo = document.getElementById("resumoCarrinhoFinal");
  const subtotalFinal = document.getElementById("subtotalFinal");
  const taxaFinal = document.getElementById("taxaFinal");
  const totalFinal = document.getElementById("totalFinal");

  resumo.innerHTML = "";

  carrinhoFinal.forEach(item => {
    const div = document.createElement("div");
    div.className = "item-carrinho";

    div.innerHTML = `
      <div>
        <p><strong>${item.nome}</strong></p>
        <p>${item.quantidade} x ${formatarMoeda(item.preco)}</p>
      </div>

      <strong>${formatarMoeda(item.preco * item.quantidade)}</strong>
    `;

    resumo.appendChild(div);
  });

  const subtotal = calcularSubtotal();
  const taxa = calcularTaxaEntrega();
  const total = subtotal + taxa;

  subtotalFinal.textContent = formatarMoeda(subtotal);
  taxaFinal.textContent = formatarMoeda(taxa);
  totalFinal.textContent = formatarMoeda(total);
}

function voltarCardapio() {
  window.location.href = "index.html";
}

function mostrarBuscaCadastro() {
  document.getElementById("areaBuscaCadastro").classList.remove("escondido");
  document.getElementById("areaDadosCliente").classList.add("escondido");
}

function mostrarNovoCadastro() {
  document.getElementById("areaBuscaCadastro").classList.add("escondido");
  document.getElementById("areaDadosCliente").classList.remove("escondido");

  document.getElementById("telefone").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("endereco").value = "";

  document.getElementById("telefone").focus();
}

async function buscarCliente() {
  const telefoneBusca = document.getElementById("telefoneBusca").value.trim();
  const mensagemCliente = document.getElementById("mensagemCliente");

  if (!telefoneBusca) {
    alert("Digite o telefone para buscar o cadastro.");
    return;
  }

  mensagemCliente.textContent = "Buscando cadastro...";

  try {
    const resposta = await fetch(`${URL_APPS_SCRIPT}?acao=buscarCliente&telefone=${encodeURIComponent(telefoneBusca)}`);
    const dados = await resposta.json();

    if (dados.sucesso && dados.encontrado) {
      mensagemCliente.textContent = "Cadastro encontrado! Confira os dados antes de finalizar.";

      document.getElementById("areaDadosCliente").classList.remove("escondido");

      document.getElementById("telefone").value = dados.cliente.telefone;
      document.getElementById("nome").value = dados.cliente.nome;
      document.getElementById("endereco").value = dados.cliente.endereco;
    } else {
      mensagemCliente.textContent = "Cliente não encontrado. Preencha os dados para novo cadastro.";

      document.getElementById("areaDadosCliente").classList.remove("escondido");
      document.getElementById("telefone").value = telefoneBusca;
      document.getElementById("nome").focus();
    }
  } catch (erro) {
    console.error("Erro ao buscar cliente:", erro);
    mensagemCliente.textContent = "Erro ao buscar cliente. Tente novamente.";
  }
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

  const itensHtml = carrinhoFinal.map(item => {
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

async function enviarWhatsApp() {
  const telefoneCliente = document.getElementById("telefone").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const pagamento = document.getElementById("pagamento").value;
  const observacao = document.getElementById("observacao").value.trim();

  const subtotal = calcularSubtotal();
  const taxa = calcularTaxaEntrega();
  const total = subtotal + taxa;

  const itensTexto = carrinhoFinal.map(item => {
    return `- ${item.quantidade}x ${item.nome} = ${formatarMoeda(item.preco * item.quantidade)}`;
  }).join("\n");

  const pedido = {
    acao: "salvarPedido",
    nome: nome,
    telefone: telefoneCliente,
    endereco: endereco,
    pagamento: pagamento,
    itens: itensTexto,
    subtotal: subtotal,
    taxaEntrega: taxa,
    total: total,
    observacao: observacao || "Nenhuma"
  };

  const cliente = {
    acao: "salvarCliente",
    nome: nome,
    telefone: telefoneCliente,
    endereco: endereco
  };

  try {
    await fetch(URL_APPS_SCRIPT, {
      method: "POST",
      body: JSON.stringify(cliente)
    });

    const respostaPedido = await fetch(URL_APPS_SCRIPT, {
      method: "POST",
      body: JSON.stringify(pedido)
    });

    const resultadoPedido = await respostaPedido.json();

    if (!resultadoPedido.sucesso) {
      alert("Erro ao salvar pedido na planilha.");
      return;
    }

    const mensagem = `
*NOVO PEDIDO - LANCHE DA CARLA*

*Pedido:* ${resultadoPedido.idPedido}
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

    localStorage.removeItem("carrinhoLancheCarla");

    const url = `https://wa.me/${telefoneLancheCarla}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

  } catch (erro) {
    console.error("Erro ao salvar pedido:", erro);
    alert("Erro ao salvar pedido. Verifique a conexão ou a URL do Apps Script.");
  }
}

carregarCarrinhoFinal();