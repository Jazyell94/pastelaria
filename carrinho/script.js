let formaEntregaSelecionada = "Entrega";

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
  const mensagemVazio = document.getElementById("mensagem-carrinho-vazio");

  lista.innerHTML = "";
  let total = 0;

  if (carrinho.length === 0) {
    if (mensagemVazio) mensagemVazio.style.display = "block";
    if (totalEl) totalEl.textContent = "R$ 0,00";
    return;
  } else {
    if (mensagemVazio) mensagemVazio.style.display = "none";
  }

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

  document.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', () => alterarQuantidade(btn.dataset.id, 1));
  });

  document.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', () => alterarQuantidade(btn.dataset.id, -1));
  });
}


// === FUNÇÃO AUXILIAR: TOTAL DO CARRINHO ===
function getTotalCarrinho() {
  const carrinho = getCarrinho();
  return carrinho.reduce((acc, item) => {
    const preco = parseFloat(item.preco) || 0;
    return acc + preco * item.quantidade;
  }, 0);
}

// === FUNÇÃO AUXILIAR: PARSE DE VALOR MONETÁRIO FORMATO "R$ x,xx" PARA NUMBER ===
function parseValorReal(str) {
  return parseFloat(
    str
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "") // remove separador de milhar (se houver)
      .replace(",", ".")  // troca vírgula decimal por ponto
  );
}

// === CHECKOUT: INICIAR PROCESSO ===
function iniciarCheckout() {
  const carrinho = getCarrinho();

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  document.getElementById("checkout-container").style.display = "flex";
  mostrarEtapa(1);
}

// === MOSTRAR ETAPA DO CHECKOUT ===
function mostrarEtapa(numero) {
  document.querySelectorAll(".etapa").forEach(etapa => etapa.classList.remove("ativa"));
  const atual = document.getElementById(`etapa-${numero}`);
  if (atual) atual.classList.add("ativa");
}

function telefoneEhValido(numeroFormatado) {
  const apenasNumeros = numeroFormatado.replace(/\D/g, "");
  return /^\d{11}$/.test(apenasNumeros) && apenasNumeros[2] === "9";
}


// === FECHAR CHECKOUT ===
function fecharCheckout() {
  document.getElementById("checkout-container").style.display = "none";
  mostrarEtapa(1); // opcional: voltar para primeira etapa
}


function mostrarEnderecoLoja() {
  document.querySelectorAll(".etapa").forEach(etapa => etapa.classList.remove("ativa"));
  document.querySelectorAll(".etapa").forEach(etapa => etapa.classList.add("hidden"));
  
  const etapaLoja = document.getElementById("etapa-endereco-loja");
  etapaLoja.classList.remove("hidden");
  etapaLoja.classList.add("ativa");
}



// === AVANÇAR PARA PRÓXIMA ETAPA COM VALIDAÇÃO ===
function avancarEtapa(numero) {
  const etapaAtual = document.querySelector(".etapa.ativa");
  const campos = etapaAtual.querySelectorAll("input, select, textarea");

  let todosPreenchidos = true;

  campos.forEach(campo => {
    const idCampo = campo.id || "";

    // Permitir que o campo de número da casa esteja vazio
    if (idCampo === "checkout-numero" || idCampo === "checkout-ponto") {
      return; // ignora validação desses campos
    }

    if (campo.type !== "checkbox" && campo.type !== "radio" && campo.value.trim() === "") {
      todosPreenchidos = false;
    }
  });

  if (!todosPreenchidos) {
    alert("Por favor, preencha todos os campos obrigatórios antes de continuar.");
    return;
  }

   // ⚠️ VALIDAÇÃO ESPECÍFICA DO TELEFONE
  const telInput = document.getElementById("checkout-telefone");
  if (telInput && !telefoneEhValido(telInput.value)) {
    telInput.style.border = "2px solid red";
    alert("Digite um número de telefone válido com DDD (ex: (11) 91234-5678).");
    return;
  }

  mostrarEtapa(numero);
}

// === NAVEGAÇÃO MANUAL ENTRE ETAPAS ===
function irParaEtapa(numero) {
  mostrarEtapa(numero);
}

// === FORMATAÇÃO DA DATA E HORA ===
function getDataHoraLocalMySQL() {
  const agora = new Date();
  agora.setHours(agora.getHours() - 3); // Ajusta -3h para UTC−3 (horário de Brasília)
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const segundo = String(agora.getSeconds()).padStart(2, '0');
  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}


// Quando clicar no botão de retirada:
document.getElementById("etapa-endereco-loja").addEventListener("click", () => {
  formaEntregaSelecionada = "Retirada";
});



// === FUNÇÃO PRINCIPAL: FINALIZAR PEDIDO E ENVIAR AO BACK-END ===
function finalizarPedido() {

  let nome = "";
  let telefone = "";

  if (formaEntregaSelecionada === "Retirada") {
    nome = document.getElementById("nome-retirada")?.value.trim() || "";
    telefone = document.getElementById("telefone-retirada")?.value.trim() || "";
  } else if (formaEntregaSelecionada === "Entrega") {
    nome = document.getElementById("nome-entrega")?.value.trim() || "";
    telefone = document.getElementById("telefone-entrega")?.value.trim() || "";
  }

  // Endereço (válido apenas para entrega)
  const rua = document.getElementById("checkout-rua")?.value.trim() || "";
  const numero = document.getElementById("checkout-numero")?.value.trim() || "";
  const bairro = document.getElementById("checkout-bairro")?.value.trim() || "";
  const ponto = document.getElementById("checkout-ponto")?.value.trim() || "";

  const pagamento = document.getElementById("checkout-pagamento")?.value || "";

  let pixPago = "nao";
  if (pagamento === "Pix") {
    pixPago = document.getElementById("pix-pago")?.checked ? "sim" : "nao";
  }

  const carrinho = getCarrinho();

  let troco = null;
  if (pagamento === "Dinheiro") {
    const precisaTroco = document.querySelector('input[name="precisaTroco"]:checked')?.value === "sim";
    if (precisaTroco) {
      const recebidoRaw = document.getElementById("input-troco")?.value || "";
      const recebido = parseValorReal(recebidoRaw);
      const total = getTotalCarrinho();
      if (!isNaN(recebido)) {
        troco = recebido - total;
      }
    } else {
      troco = 0;
    }
  }

  const pedido = {
    cliente: { nome, telefone },
    endereco: { rua, numero, bairro, ponto },
    pagamento,
    troco,
    pixPago,
    produtos: carrinho,
    forma_entrega: formaEntregaSelecionada,
    data: getDataHoraLocalMySQL(),
    total: getTotalCarrinho(),
  };

  console.log("dados", pedido);
  fetch("https://jazye5785.c44.integrator.host/api/pedidos", {
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
      window.location.href = "../finalizado/finalizado.html";
    })
    .catch(err => {
      console.error("Erro ao enviar pedido:", err);
      alert("Houve um erro ao enviar o pedido. Tente novamente.");
    });
}










// === MANIPULAÇÃO DO CAMPO DE TROCO ===

// Função para montar o campo troco (apenas uma vez)
function montarCampoTroco() {
  const campo = document.getElementById("campo-troco");
  campo.innerHTML = `
    <div  style="margin-top: 8px; font-size: .9rem">
      <strong>Total:</strong> <span id="valor-total-checkout">R$ 0,00</span>
    </div>

    <div class="troco-container">
      <label><strong>Vai precisar de troco?</strong></label><br>
      <div class="box-select">
        <input type="radio" name="precisaTroco" value="nao" id="troco-nao" checked>
        <label for="troco-nao">Não</label>
      </div>
      <div class="box-select">
        <input type="radio" name="precisaTroco" value="sim" id="troco-sim">
        <label for="troco-sim">Sim</label>
      </div>
    </div>

    <div id="wrapper-troco-valor" style="display:none;">
      <input type="text" id="input-troco" placeholder="Troco pra quanto?" />
      <div id="resultado-troco" style="margin-top:4px; font-size:0.9em;"></div>
    </div>
  `;

  // Listeners para os rádios de troco
  document.getElementById("troco-sim").addEventListener("change", () => {
    const wrapper = document.getElementById("wrapper-troco-valor");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "space-between";
    atualizarTotalETroco();
  });
  document.getElementById("troco-nao").addEventListener("change", () => {
    const wrapper = document.getElementById("wrapper-troco-valor");
    wrapper.style.display = "none";
    document.getElementById("input-troco").value = "";
    document.getElementById("resultado-troco").textContent = "";
  });

  // Listener para formatação e atualização ao digitar valor do troco
  const inputTroco = document.getElementById("input-troco");

  inputTroco.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    if (valor.length === 0) valor = "0";

    // Limita valor muito grande (ex: 99999999)
    if (valor.length > 8) valor = valor.slice(0, 8);

    // Formata como reais (centavos no final)
    valor = (parseInt(valor, 10) / 100).toFixed(2) + "";

    // Converte para formato brasileiro (vírgula)
    valor = valor.replace(".", ",");

    e.target.value = "R$ " + valor;

    atualizarTotalETroco();
  });
}

// Atualiza exibição do total e calcula o troco / falta
function atualizarTotalETroco() {
  const total = getTotalCarrinho();
  const totalEl = document.getElementById("valor-total-checkout");
  if (totalEl) {
    totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  }

  const trocoSim = document.getElementById("troco-sim")?.checked;
  const inputTroco = document.getElementById("input-troco");
  const resultado = document.getElementById("resultado-troco");

  if (trocoSim && inputTroco && resultado) {
    let valorRecebidoRaw = inputTroco.value
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const valorRecebido = parseFloat(valorRecebidoRaw);

    if (!isNaN(valorRecebido)) {
      const troco = valorRecebido - total;
      if (troco < 0) {
        resultado.textContent = `Faltam R$ ${Math.abs(troco).toFixed(2).replace(".", ",")}`;
      } else {
        resultado.textContent = `Troco: R$ ${troco.toFixed(2).replace(".", ",")}`;
      }
    } else {
      resultado.textContent = "";
    }
  } else if (resultado) {
    resultado.textContent = "";
  }
}

// === EXIBIÇÃO DO CAMPO TROCO CONFORME FORMA DE PAGAMENTO ===
function verificarTroco() {
  const pagamento = document.getElementById("checkout-pagamento").value;
  const campoTroco = document.getElementById("campo-troco");
  const campoPix = document.getElementById("campo-pix");

  if (!campoTroco || !campoPix) {
    console.warn("Elemento #campo-troco ou #campo-pix não encontrado no DOM");
    return;
  }

  if (pagamento === "Dinheiro") {
    if (!campoTroco.dataset.init) {
      montarCampoTroco();
      campoTroco.dataset.init = "1";
    }
    atualizarTotalETroco();
    campoTroco.style.display = "block";
    campoPix.innerHTML = "";  // limpa pix se tinha algo
  } else {
    campoTroco.style.display = "none";

    if (pagamento === "Pix") {
      mostrarOpcoesPix();
    } else {
      campoPix.innerHTML = "";
    }
  } 

}

// === MÁSCARA PARA TELEFONE NO CHECKOUT ===
document.addEventListener("DOMContentLoaded", () => {
  const checkoutTelefoneInputs = document.querySelectorAll(".checkout-telefone");

  checkoutTelefoneInputs.forEach(input => {
    input.addEventListener("input", () => {
      // Remover tudo que não for dígito
      let value = input.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);

      // Aplicar máscara
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      } else {
        value = value.replace(/^(\d*)/, "($1");
      }

      input.value = value;

      // Validação visual simples (opcional)
      if (telefoneEhValido(value)) {
        input.style.border = "1px solid green";
      } else {
        input.style.border = "1px solid red";
      }
    });
  });



  function telefoneEhValido(numeroFormatado) {
    const apenasNumeros = numeroFormatado.replace(/\D/g, "");
    // Telefones válidos no Brasil: 11 dígitos (2 DDD + 9 número celular iniciando com 9)
    return /^\d{11}$/.test(apenasNumeros) && apenasNumeros[2] === "9";
  }



  // Apenas números no número da casa
  const checkoutNumeroInput = document.getElementById("checkout-numero");
  if (checkoutNumeroInput) {
    checkoutNumeroInput.addEventListener("input", () => {
      checkoutNumeroInput.value = checkoutNumeroInput.value.replace(/\D/g, "");
    });
  }

  // Atualizar campo troco quando muda forma de pagamento
  const pagamentoSelect = document.getElementById("checkout-pagamento");
  if (pagamentoSelect) {
    pagamentoSelect.addEventListener("change", verificarTroco);
  }

  // Inicializa exibição correta do campo troco caso já esteja "Dinheiro" selecionado
  verificarTroco();
});



// === MANIPULAÇÃO DO CAMPO DE PIX ===

function mostrarOpcoesPix() {
  const campoPix = document.getElementById("campo-pix");
  campoPix.innerHTML = `
    <div class="pix-box">
      <label style="display: block;">
        Chave Pix:
      </label>
      <div id="pix-chave" 
          style="user-select: text; cursor: pointer; padding: 8px; background: #eee; border: 1px solid #ccc; border-radius: 4px; max-width: 300px;"
          title="Clique para copiar a chave">
        meupix@exemplo.com
      </div>
    </div>
    <small style="display: block; margin-top: 4px;">Clique na chave para copiar</small>

    <div class="pix-input">
      <p>Assim que efetuar o pagamento via PIX, pedimos que nos encaminhe o comprovante pelo WhatsApp. Isso nos ajuda a localizar seu pagamento mais rapidamente. :)
      </p>
    </div>

    <div id="pix-copia-msg" style="color: green; margin-top: 8px; display: none;">
      Chave Pix copiada para a área de transferência!
    </div>
  `;

  const pixChave = document.getElementById("pix-chave");
  const msgCopia = document.getElementById("pix-copia-msg");

  pixChave.addEventListener("click", () => {
    function copiarTexto(texto) {
      const inputTmp = document.createElement("input");
      inputTmp.value = texto;
      document.body.appendChild(inputTmp);
      inputTmp.select();
      inputTmp.setSelectionRange(0, 99999);
      const sucesso = document.execCommand("copy");
      document.body.removeChild(inputTmp);
      return sucesso;
    }

    const texto = pixChave.textContent.trim();
    const copiado = copiarTexto(texto);

    if (copiado) {
      msgCopia.style.display = "block";
      setTimeout(() => {
        msgCopia.style.display = "none";
      }, 2000);
    } else {
      alert("Erro ao copiar a chave Pix. Tente copiar manualmente.");
    }
  });
}








// === INICIALIZA EXIBIÇÃO DO CARRINHO AO ABRIR PÁGINA ===
mostrarCarrinho();








