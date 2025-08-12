let previousOrders = [];

// =====================
// INICIALIZAÇÃO
// =====================
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  setInitialDate();
  fetchOrdersByDate();
  startPolling();
});


// =====================
// FETCH DE PEDIDOS POR DATA
// =====================
async function fetchOrdersByDate() {
  const date = document.getElementById('datePicker').value;
  console.log("Data enviada:", date);

  try {
    const response = await fetch(`https://jazye5785.c44.integrator.host/clientes?date=${encodeURIComponent(date)}`);
    if (!response.ok) throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);

    const pedidos = await response.json();

    // Comparar se há pedidos novos
    const novosPedidos = pedidos.filter(p => !previousOrders.some(old => old.id === p.id));
    if (novosPedidos.length > 0) {
      playNewOrderSound();
      showNotification(`${novosPedidos.length} novo(s) pedido(s)!`);
      novosPedidos.forEach(p => {
        showSystemNotification("Novo pedido recebido", `Pedido #${p.id} de ${p.nome}`);
      });
    }

    previousOrders = pedidos;
    displayOrders(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
  }
}

// INICIA O POLLING (a cada 5 segundos)
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

  if (pedido.entrega === "Entrega") {
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
          </div>
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
  } else {
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
  }

  container.appendChild(card);
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




