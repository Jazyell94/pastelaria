// Verifica horário de funcionamento a cada minuto
function verificaHorarioDeFuncionamento() {
  const agora = new Date();

  const diasSemana = [
    'domingo',
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado'
  ];

  const diaAtual = diasSemana[agora.getDay()];
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  const horarios = {
    domingo:  { abertura: [8, 0], fechamento: [22, 0] },
    segunda:  { abertura: [8, 0], fechamento: [22, 0] },
    terca:    { abertura: [8, 0], fechamento: [22, 0] },
    quarta:   { abertura: [8, 0], fechamento: [22, 0] },
    quinta:   { abertura: [8, 0], fechamento: [22, 0] },
    sexta:    { abertura: [8, 0], fechamento: [18, 0] },
    sabado:   { abertura: [18, 0], fechamento: [22, 0] }
  };

  const { abertura, fechamento } = horarios[diaAtual];

  const [horaAbertura, minutoAbertura] = abertura;
  const [horaFechamento, minutoFechamento] = fechamento;

  const foraDoHorario =
    horaAtual < horaAbertura ||
    (horaAtual === horaAbertura && minutoAtual < minutoAbertura) ||
    horaAtual > horaFechamento ||
    (horaAtual === horaFechamento && minutoAtual >= minutoFechamento);

  const estaNaPaginaFechada = window.location.pathname.includes('sabordacasa/fechado/');

  if (foraDoHorario && !estaNaPaginaFechada) {
    window.location.href = '../fechado/index.html';
  }

  if (!foraDoHorario && estaNaPaginaFechada) {
    window.location.href = '../index.html';
  }
}

setInterval(verificaHorarioDeFuncionamento, 60000);
verificaHorarioDeFuncionamento();



// Lista de categorias conforme o HTML
const categorias = ['combos', 'pastel', 'bomba', 'coxinha', 'bebidas'];

// Carrega todas as categorias ao iniciar
function carregarCategorias() {
  categorias.forEach(cat => loadCategoryData(cat));
}

// Renderiza os produtos no container certo
function renderProducts(category, products) {
  const container = document.getElementById(`${category}-content`);
  if (!container) {
    console.warn(`Container #${category}-content não encontrado.`);
    return;
  }

  container.innerHTML = ''; // Limpa o conteúdo anterior

  products.forEach((product, index) => {
    const html = `
      <div class="product-container">
        <div class="content">
          <div class="product-img">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-desc">
            <span class="product-name">${product.name}</span>
            <div class="price">
              <span>R$${product.price}</span>
            </div>
          </div>
          <div class="add-to-cart">
            <i class="fa-solid fa-plus" data-index="${index}"></i>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });

  // Eventos de adicionar ao carrinho
  const buttons = container.querySelectorAll('.add-to-cart i');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      const produto = products[index];
      adicionarAoCarrinho(produto);
    });
  });
}

// Função para carregar JSON e renderizar produtos
async function loadCategoryData(category) {
  try {
    const response = await fetch(`data/${category}.json`);
    const data = await response.json();
    renderProducts(category, data);
  } catch (error) {
    console.error(`Erro ao carregar ${category}:`, error);
    const container = document.getElementById(`${category}-content`);
    if (container) {
      container.innerHTML = `<p>Erro ao carregar os produtos de ${category}.</p>`;
    }
  }
}

// Clique nas categorias
document.querySelectorAll('.box').forEach(box => {
  box.addEventListener('click', () => {
    const selected = box.getAttribute('data-category');

    // Destaca a categoria ativa
    document.querySelectorAll('.box').forEach(b => b.classList.remove('active'));
    box.classList.add('active');

    // Oculta todos os conteúdos
    document.querySelectorAll('.content-box').forEach(div => {
      div.classList.add('hidden');
    });

    // Mostra a categoria clicada
    const activeSection = document.getElementById(`${selected}-content`);
    if (activeSection) activeSection.classList.remove('hidden');
  });
});

// Scroll suave para  categoria ir para o início do container
document.querySelectorAll('.box').forEach(box => {
  box.addEventListener('click', () => {
    box.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  });
});

// Carrega tudo quando a página for carregada
window.addEventListener('DOMContentLoaded', carregarCategorias);


// Ativa a primeira categoria ao iniciar
document.querySelector('.box[data-category="combos"]')?.classList.add('active');
document.getElementById('combos-content')?.classList.remove('hidden');

// Carrinho
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function adicionarAoCarrinho(produto) {
  const carrinho = getCarrinho();

  const itemExistente = carrinho.find(item => item.id === produto.id);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.name,
      preco: produto.price,
      imagem: produto.image,
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
  const carrinho = getCarrinho();
  const totalQuantidade = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  const contador = document.getElementById("contador-itens");
  if (contador) {
    if (totalQuantidade > 0) {
      contador.textContent = totalQuantidade;
      contador.style.display = "flex";

      // Animação pulse
      contador.classList.remove("atualizado");
      void contador.offsetWidth; // trigger reflow
      contador.classList.add("atualizado");
    } else {
      contador.style.display = "none";
    }
  }
}

// Inicia carregamento
window.addEventListener('load', () => {
  carregarCategorias();
  atualizarContadorCarrinho();
});


const inputBusca = document.querySelector('.search-button-home input');
const resultadoPesquisa = document.getElementById('resultado-pesquisa');

inputBusca.addEventListener('input', async () => {
  const termo = inputBusca.value.trim().toLowerCase();

  // Se o campo estiver vazio, remove resultados e mostra categorias
  if (!termo) {
    resultadoPesquisa.classList.add('hidden');
    resultadoPesquisa.innerHTML = '';
    document.querySelectorAll('.content-box').forEach(div => div.classList.add('hidden'));
    const ativa = document.querySelector('.box.active')?.getAttribute('data-category');
    if (ativa) {
      document.getElementById(`${ativa}-content`)?.classList.remove('hidden');
    }
    return;
  }

  // Oculta todas as seções de categorias
  document.querySelectorAll('.content-box').forEach(div => div.classList.add('hidden'));

  resultadoPesquisa.innerHTML = '';
  resultadoPesquisa.classList.remove('hidden');

  let resultados = [];

  for (const categoria of categorias) {
    try {
      const response = await fetch(`data/${categoria}.json`);
      const produtos = await response.json();

      const filtrados = produtos.filter(prod =>
        prod.name.toLowerCase().includes(termo)
      ).map(prod => ({ ...prod, categoria }));

      resultados = resultados.concat(filtrados);
    } catch (error) {
      console.error(`Erro ao buscar em ${categoria}:`, error);
    }
  }

  if (resultados.length === 0) {
    resultadoPesquisa.innerHTML = `<p style="text-align:center;">Nenhum produto encontrado</p>`;
    return;
  }

  resultados.forEach((product, index) => {
    const html = `
      <div class="product-container">
        <div class="content">
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-desc">
                <span class="product-name">${product.name}</span>
                <div class="price">
                    <span>R$${product.price}</span>
                </div>
            </div>
            <div class="add-to-cart">
                <i class="fa-solid fa-plus" data-index="${index}"></i>
            </div>
        </div>
      </div>
    `;
    resultadoPesquisa.insertAdjacentHTML('beforeend', html);
  });

  // Eventos dos botões de carrinho nos resultados
  resultadoPesquisa.querySelectorAll('.add-to-cart i').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const produto = resultados[i];
      adicionarAoCarrinho(produto);
    });
  });
});

// MUDA O PLACEHOLDER DO SEARCH //
const input = document.querySelector('input[type="search"]');

const frases = [
  'Pastel de frango',
  'Beijinho',
  'Pastel de carne',
  'Nordestino',
  'Guaraná lata',
  'Coca-cola 2L',
  'Nutela',
];

let fraseIndex = 0;
let charIndex = 0;
let apagando = false;

function digitarPlaceholder() {
  if (!input) return;

  const fraseAtual = frases[fraseIndex];
  const textoExibido = fraseAtual.substring(0, charIndex);

  input.placeholder = textoExibido;

  if (!apagando) {
    if (charIndex < fraseAtual.length) {
      charIndex++;
      setTimeout(digitarPlaceholder, 100); // digitando
    } else {
      apagando = true;
      setTimeout(digitarPlaceholder, 1500); // pausa antes de apagar
    }
  } else {
    if (charIndex > 0) {
      charIndex--;
      setTimeout(digitarPlaceholder, 50); // apagando
    } else {
      apagando = false;
      fraseIndex = (fraseIndex + 1) % frases.length;
      setTimeout(digitarPlaceholder, 500); // pausa antes de digitar nova
    }
  }
}

// Inicia a animação após o carregamento da página
window.addEventListener('DOMContentLoaded', digitarPlaceholder);


