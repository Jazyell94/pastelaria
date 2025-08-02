const API_BASE_URL = 'http://localhost:3000';
const socket = new WebSocket('ws://localhost:3000');
let previousOrders = [];

// =====================
// INICIALIZAÇÃO
// =====================
document.addEventListener('DOMContentLoaded', () => {
  setInitialDate();
  fetchOrdersByDate();
  setupWebSocket();
});

// =====================
// FETCH DE PEDIDOS POR DATA
// =====================
async function fetchOrdersByDate() {
  const date = document.getElementById('datePicker').value;

  try {
    const response = await fetch(`${API_BASE_URL}/clientes?date=${date}`);
    if (!response.ok) throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);

    const pedidos = await response.json();
    previousOrders = pedidos;
    displayOrders(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
  }
}

// =====================
// EXIBIR PEDIDOS
// =====================
function displayOrders(pedidos) {
  const container = document.getElementById('orders-container');
  container.innerHTML = '';

  pedidos.forEach(pedido => {
    addOrder(pedido);
  });
}

// =====================
// ADICIONAR PEDIDO NA TELA
// =====================
function addOrder(pedido) {
  const container = document.getElementById('orders-container');
  const card = document.createElement('div');
  card.className = 'order-card';

  // Gera HTML dos produtos
  const produtosHtml = pedido.itens.map(item =>
    `<li>${item.quantidade}x ${item.nome} – R$ ${item.preco}</li>`
  ).join("");

  // Calcula o total dos itens (caso venha null do banco)
  const totalCalculado = pedido.itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  // Divide o endereço em partes (caso esteja tudo em um campo só chamado "endereco")
  const enderecoCompleto = pedido.endereco || '';
  const [rua = '', numero = '', bairro = ''] = enderecoCompleto.split(',');

  const dataPedido = new Date(pedido.data);
  const horaFormatada = dataPedido.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });


  card.innerHTML = `
    <div class="pedido-card">
      <div class="pedido-header">
        <h3>Pedido #${pedido.id}</h3>
        <p><strong>Hora:</strong> ${horaFormatada}</p>
        <button class="btn-imprimir" onclick="imprimirPedido(${pedido.id})">🖨️</button>
      </div>
      <div class="pedido-info">
        <p><strong>Cliente:</strong> ${pedido.nome}</p>
        <p><strong>Endereço:</strong> ${pedido.rua?.trim() || '-'}, ${pedido.numero?.trim() || '-'} - ${pedido.bairro?.trim() || '-'}</p>
        <p><strong>Ponto de referência:</strong> ${pedido.ponto}</p>
        <p><strong>Pagamento:</strong> ${pedido.pagamento}</p>
        <p><strong>Troco:</strong> R$ ${pedido.troco ?? '0,00'}</p>
        <p><strong>Total:</strong> <span class="valor-total">R$ ${pedido.total ?? totalCalculado.toFixed(2)}</span></p>
      </div>
      <div class="pedido-produtos">
        <h4>Itens:</h4>
        <ul class="lista-produtos">
          ${produtosHtml}
        </ul>
      </div>
    </div>
  `;



  container.appendChild(card);
}


// =====================
// WEBSOCKET
// =====================
function setupWebSocket() {
  socket.onopen = () => {
    console.log('WebSocket conectado');
  };

  socket.onmessage = event => {
    const pedido = JSON.parse(event.data);

    const alreadyExists = previousOrders.some(p =>
      p.id === pedido.id
    );

    if (!alreadyExists) {
      playNewOrderSound();
      showNotification('Novo pedido chegou!');
      showSystemNotification('Administração de Pedidos', 'Você tem um novo pedido!');

      previousOrders.unshift(pedido);
      addOrder(pedido);
    }
  };

  socket.onerror = error => {
    console.error('WebSocket erro:', error);
  };
}

// =====================
// SOM E NOTIFICAÇÕES
// =====================
function playNewOrderSound() {
  const audio = new Audio('notificacao.mp3');
  audio.play();
}

function showNotification(msg) {
  const notif = document.getElementById('notificacao');
  notif.innerText = msg;
  notif.classList.add('mostrar');
  setTimeout(() => notif.classList.remove('mostrar'), 4000);
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
// SELECIONAR DATA
// =====================
function setInitialDate() {
  const datePicker = document.getElementById('datePicker');
  const savedDate = localStorage.getItem('selectedDate');
  const today = new Date();

  const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  datePicker.value = savedDate || defaultDate;

  datePicker.addEventListener('change', () => {
    localStorage.setItem('selectedDate', datePicker.value);
    fetchOrdersByDate();
  });
}

function returnToTodayOrders() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('datePicker').value = today;
  fetchOrdersByDate(today);
}
