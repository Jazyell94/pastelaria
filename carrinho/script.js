// === UTILITÁRIOS DO CARRINHO ===
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function removerItem(id) {
  let carrinho = getCarrinho();
  carrinho = carrinho.filter(item => item.id !== id);
  salvarCarrinho(carrinho);
  mostrarCarrinho();
}

function alterarQuantidade(id, delta) {
  let carrinho = getCarrinho();
  const index = carrinho.findIndex(item => item.id == id);

  if (index !== -1) {
    carrinho[index].quantidade += delta;

    if (carrinho[index].quantidade < 1) {
      carrinho.splice(index, 1); // Remove item se a quantidade ficar menor que 1
    }

    salvarCarrinho(carrinho);
    mostrarCarrinho();
  }
}

// === EXIBE ITENS DO CARRINHO ===
function mostrarCarrinho() {
  const carrinho = getCarrinho();
  const lista = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("total-geral");

  lista.innerHTML = "";
  let total = 0;

  carrinho.forEach(item => {
    const preco = parseFloat(item.preco) || 0;
    const subtotal = preco * item.quantidade;
    total += subtotal;

    const container = document.createElement("div");
    container.classList.add("product-container");

    container.innerHTML = `
      <div class="content">
        <div class="product-img">
          <img src="${item.imagem}" alt="${item.nome}">
        </div>
        <div class="product-desc">
          <span class="product-name">${item.nome}</span>
          <div class="price">R$ ${preco.toFixed(2)}</div>
        </div>
        <div class="quantity-control">
          <button class="btn-minus" data-id="${item.id}">−</button>
          <span class="quantity">${item.quantidade}</span>
          <button class="btn-plus" data-id="${item.id}">+</button>
        </div>
      </div>
    `;

    lista.appendChild(container);
  });

  totalEl.textContent = `R$ ${total.toFixed(2)}`;

  // Eventos para + e -
  document.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', () => alterarQuantidade(btn.dataset.id, 1));
  });

  document.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', () => alterarQuantidade(btn.dataset.id, -1));
  });
}

// === CHECKOUT - INICIAR E ETAPAS ===
function iniciarCheckout() {
  document.getElementById("checkout-container").style.display = "flex";
  mostrarEtapa(1);
}

function mostrarEtapa(numero) {
  document.querySelectorAll(".etapa").forEach(etapa => etapa.classList.remove("ativa"));
  const atual = document.getElementById(`etapa-${numero}`);
  if (atual) atual.classList.add("ativa");
}

function fecharCheckout() {
  document.getElementById("checkout-container").style.display = "none";
  // opcional: volta para a primeira etapa para próxima vez que abrir
  mostrarEtapa(1);
}

function avancarEtapa(numero) {
  mostrarEtapa(numero);
}

function irParaEtapa(numero) {
  mostrarEtapa(numero);
}

// === CHECKOUT - FINALIZAÇÃO ===
function finalizarPedido() {
  const nome = document.getElementById("checkout-nome").value;
  const telefone = document.getElementById("checkout-telefone").value;
  const rua = document.getElementById("checkout-rua").value;
  const numero = document.getElementById("checkout-numero").value;
  const bairro = document.getElementById("checkout-bairro").value;
  const ponto = document.getElementById("checkout-ponto").value;
  const pagamento = document.getElementById("checkout-pagamento").value;
  const troco = pagamento === "Dinheiro" ? document.getElementById("checkout-troco").value : null;

  const carrinho = getCarrinho();

  if (!nome || !telefone || !rua || !numero || !bairro || !pagamento) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const pedido = {
    cliente: { nome, telefone },
    endereco: { rua, numero, bairro, ponto },
    pagamento,
    troco,
    produtos: carrinho,
    data: new Date().toISOString(),
  };

  fetch("http://localhost:3000/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  })
    .then(res => {
      if (!res.ok) throw new Error(`Erro ao enviar pedido: ${res.status}`);
      return res.json();
    })
    .then(data => {
      alert("Pedido enviado com sucesso!");
      localStorage.removeItem("carrinho");
      location.reload();
    })
    .catch(err => {
      console.error("Erro ao enviar pedido:", err);
      alert("Houve um erro ao enviar o pedido. Tente novamente.");
    });
}

// === TROCO DINHEIRO ===
function verificarTroco() {
  const pagamento = document.getElementById("checkout-pagamento").value;
  const campoTroco = document.getElementById("campo-troco");
  campoTroco.style.display = pagamento === "Dinheiro" ? "block" : "none";
}

// === INICIALIZA AO ABRIR A PÁGINA ===
mostrarCarrinho();
