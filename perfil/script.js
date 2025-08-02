// Simulação do usuário logado
const usuario = { id: 1 };

const form = document.getElementById("form-dados");
const editarBtn = document.getElementById("btn-editar-dados");
const nomeInput = document.getElementById("nome");
const tituloNome = document.getElementById("titulo-nome");
const numeroPessoalInput = document.getElementById("numeroPessoal");
const numeroEnderecoInput = document.getElementById("numeroEndereco");

if (form && editarBtn && nomeInput && tituloNome && numeroPessoalInput && numeroEnderecoInput) {
  
  // Função para limpar o número (deixar só dígitos)
  function limparNumero(numero) {
    return numero.replace(/\D/g, "");
  }

  // Carrega os dados do perfil do usuário
  function carregarPerfil() {
    fetch(`http://localhost:3000/perfil/${usuario.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Perfil não encontrado");
        return res.json();
      })
      .then(perfil => {
        nomeInput.value = perfil.nome || "";
        document.getElementById("rua").value = perfil.rua || "";
        document.getElementById("bairro").value = perfil.bairro || "";
        numeroEnderecoInput.value = perfil.numeroEndereco || "";
        document.getElementById("pontoReferencia").value = perfil.pontoReferencia || "";

        // Preenche o número pessoal e dispara evento para aplicar máscara
        numeroPessoalInput.value = perfil.numeroPessoal || "";
        numeroPessoalInput.dispatchEvent(new Event("input"));

        const enderecoTexto = document.querySelector(".endereco p");
        if (enderecoTexto) {
          enderecoTexto.innerHTML = perfil.rua
            ? `<span><i class="fa-solid fa-location-dot"></i></span> ${perfil.rua}`
            : `<span><i class="fa-solid fa-location-dot"></i></span> Endereço não cadastrado`;
        }

        if (typeof carregarCategorias === "function") {
          carregarCategorias(); // se essa função existir
        }
      })
      .catch(() => {
        if (typeof carregarCategorias === "function") {
          carregarCategorias(); // mesmo que não tenha perfil
        }
      });
  }

  // Inicializa carregando perfil
  carregarPerfil();

  // Editar dados
  editarBtn.addEventListener("click", e => {
    e.preventDefault();
    const inputs = form.querySelectorAll("input[type='text'], input[type='number']");
    inputs.forEach(input => input.removeAttribute("readonly"));
    nomeInput.focus();
  });

  // Salvar dados
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const inputs = form.querySelectorAll("input[type='text'], input[type='number']");
    inputs.forEach(input => input.setAttribute("readonly", true));

    if (nomeInput && tituloNome) {
      const primeiroNome = nomeInput.value.trim().split(" ")[0];
      tituloNome.textContent = `Olá ${primeiroNome}`;
    }

    const dados = {
      nome: nomeInput.value.trim(),
      // envia o número limpo, sem máscara (só números)
      numeroPessoal: limparNumero(numeroPessoalInput.value),
      rua: document.getElementById("rua").value.trim(),
      bairro: document.getElementById("bairro").value.trim(),
      numeroEndereco: numeroEnderecoInput.value.trim(),
      pontoReferencia: document.getElementById("pontoReferencia").value.trim(),
    };

    try {
      const response = await fetch(`http://localhost:3000/perfil/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Dados salvos com sucesso!");
      } else {
        alert(result.error || "Erro ao salvar os dados.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao enviar os dados ao servidor.");
    }
  });

  // Máscara telefone
  numeroPessoalInput.addEventListener("input", () => {
    let value = numeroPessoalInput.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else {
      value = value.replace(/^(\d*)/, "($1");
    }
    numeroPessoalInput.value = value;
  });

  // Somente números no número da casa
  numeroEnderecoInput.addEventListener("input", () => {
    numeroEnderecoInput.value = numeroEnderecoInput.value.replace(/\D/g, "");
  });

} else {
  console.warn("Elementos do formulário não encontrados na página.");
}
