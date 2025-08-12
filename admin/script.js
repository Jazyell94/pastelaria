let previousOrders = [];
let ultimoPedidoId = null;
let audioLiberado = false;

// =====================
// INICIALIZAÇÃO
// =====================
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  // Libera som após primeira interação
  document.body.addEventListener("click", () => {
    audioLiberado = true;
  }, { once: true });

  setInitialDate(() => {
    fetchOrdersByDate();
    startPolling();
  });
});

// =====================
// FETCH DE PEDIDOS POR DATA
// =====================
async function fetchOrdersByDate() {
  const datePicker = document.getElementById('datePicker');
  const date = datePicker?.value || getTodayDate();

  console.log("Data enviada:", date);

  if (!date) {
    console.warn("Data inválida, fetch abortado");
    return;
  }

  try {
    const response = await fetch(`https://jazye5785.c44.integrator.host/clientes?date=${encodeURIComponent(date)}`);
    if (!response.ok) throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);

    const pedidos = await response.json();

    if (pedidos.length > 0) {
      const pedidoMaisRecente = pedidos[0]; // supondo que vem do mais novo para o mais antigo

      if (pedidoMaisRecente.id !== ultimoPedidoId) {
        ultimoPedidoId = pedidoMaisRecente.id;

        if (previousOrders.length > 0) { 
          showSystemNotification(
            `Novo Pedido #${pedidoMaisRecente.id}`,
            `${pedidoMaisRecente.nome} - Total R$ ${pedidoMaisRecente.itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0).toFixed(2)}`
          );
          playNewOrderSound();
        }
      }
    }

    previousOrders = pedidos;
    displayOrders(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
  }
}

// =====================
// INICIA O POLLING (a cada 5 segundos)
// =====================
function startPolling() {
  setInterval(fetchOrdersByDate, 5000);
}

// =====================
// EXIBIR PEDIDOS
// =====================
function displayOrders(pedidos) {
  const container = document.getElementById('orders-container');
  container.innerHTML = '';
  pedidos.forEach(pedido => addOrder(pedido));
}

// =====================
// ADICIONAR PEDIDO NA TELA
// =====================
function addOrder(pedido) {
  const container = document.getElementById("orders-container");
  const card = document.createElement("div");
  card.className = "order-card";

  const produtosHtml = pedido.itens.map(item => `
    <li>${item.quantidade}x ${item.nome} - R$ ${item.preco}</li>
  `).join("");

  const totalCalculado = pedido.itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const dataPedido = new Date(pedido.data);
  const horaFormatada = dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  card.innerHTML = `
    <div class="pedido-card">
      <div class="pedido-header">
        <h3>Pedido #${pedido.id}</h3>
        <p><strong>${pedido.entrega}</strong></p>
        <p><strong>Hora:</strong> ${horaFormatada}</p>
      </div>
      <div class="pedido-info">
        <p><strong>Nome:</strong> ${pedido.nome}</p>
        <p><strong>Telefone:</strong> ${pedido.telefone}</p>
        ${pedido.entrega === "Entrega" ? `
        <div class="pedido-endereco">
          <p><strong>Endereço:</strong></p>
          <span>${pedido.rua?.trim() || ''}, ${pedido.numero?.trim() || ''} - ${pedido.bairro?.trim() || ''}</span>
        </div>
        <div class="pedido-ponto">
          <p><strong>Ponto de referência:</strong></p>
          <span>${pedido.ponto || ''}</span>
        </div>
        <div class="pedido-pagamento">
          <p><strong>Pagamento:</strong> ${pedido.pagamento}</p>
          <p><strong>Troco:</strong> R$ ${pedido.troco ?? '0,00'}</p>
        </div>` : ''}
      </div>
      <div class="pedido-produtos">
        <p><strong>Produtos:</strong></p>
        <ul>${produtosHtml}</ul>
      </div>
      <div class="valor-total">
        <p><strong>Total:</strong> R$ ${totalCalculado.toFixed(2)}</p>
      </div>
    </div>
  `;

  container.appendChild(card);
}

// =====================
// SOM E NOTIFICAÇÕES
// =====================
function playNewOrderSound() {
  if (!audioLiberado) return; // No iPhone, só toca depois de interação
  const audio = new Audio('notificacao.mp3');
  audio.play().catch(() => {
    console.log("Som não pôde ser reproduzido sem interação do usuário");
  });
}

function showSystemNotification(titulo, mensagem) {
  if (Notification.permission === "granted") {
    new Notification(titulo, { body: mensagem });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(titulo, { body: mensagem });
      }
    });
  }
}

// =====================
// DATA HOJE E EVENTOS
// =====================
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function setInitialDate(callback) {
  const datePicker = document.getElementById('datePicker');
  const savedDate = localStorage.getItem('selectedDate');
  const today = getTodayDate();

  datePicker.value = savedDate || today;

  datePicker.addEventListener('change', () => {
    localStorage.setItem('selectedDate', datePicker.value);
    ultimoPedidoId = null;
    fetchOrdersByDate();
  });

  if (callback) callback();
}

function returnToTodayOrders() {
  const datePicker = document.getElementById('datePicker');
  datePicker.value = getTodayDate();
  localStorage.setItem('selectedDate', datePicker.value);
  ultimoPedidoId = null;
  fetchOrdersByDate();
}
