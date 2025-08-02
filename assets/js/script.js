// Lista de categorias
const categorias = ['pastel', 'bomba', 'coxinha'];

// Carrega todas as categorias
function carregarCategorias() {
  categorias.forEach(cat => loadCategoryData(cat));
}

// Função que renderiza os produtos no container certo
function renderProducts(category, products) {
  const container = document.getElementById(`${category}-content`);
  container.innerHTML = ''; // limpa conteúdo anterior

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

  // Adiciona evento aos botões de adicionar ao carrinho
  const buttons = container.querySelectorAll('.add-to-cart i');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      const produto = products[index];
      adicionarAoCarrinho(produto);
    });
  });
}

// Função para carregar JSON e chamar render
async function loadCategoryData(category) {
  try {
    const response = await fetch(`data/${category}.json`);
    const data = await response.json();
    renderProducts(category, data);
  } catch (error) {
    console.error(`Erro ao carregar ${category}:`, error);
    const container = document.getElementById(`${category}-content`);
    container.innerHTML = `<p>Erro ao carregar os produtos de ${category}.</p>`;
  }
}

// Clique nas categorias
document.querySelectorAll('.box').forEach(box => {
  box.addEventListener('click', () => {
    const selected = box.getAttribute('data-category');

    document.querySelectorAll('.box').forEach(b => b.classList.remove('active'));
    box.classList.add('active');

    document.querySelectorAll('.content-box').forEach(div => {
      div.classList.add('hidden');
    });

    const activeSection = document.getElementById(`${selected}-content`);
    if (activeSection) activeSection.classList.remove('hidden');
  });
});

// Ativa a primeira categoria ao iniciar
document.querySelector('.box[data-category="pastel"]')?.classList.add('active');
document.getElementById('pastel-content')?.classList.remove('hidden');

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
