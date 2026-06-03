async function carregarLivros() {
    const resposta = await fetch("/livros");
    const livros = await resposta.json();

    const lista = document.getElementById("listaLivros");
    const select = document.getElementById("livroSelect");

    lista.innerHTML = "";
    select.innerHTML = "";

    livros.forEach(livro => {

        const li = document.createElement("li");

        li.innerHTML = `
      ${livro.titulo} - ${livro.autor}
      <button onclick="excluirLivro(${livro.id})">
      Excluir
      </button>
    `;

        lista.appendChild(li);

        const option = document.createElement("option");
        option.value = livro.id;
        option.textContent = livro.titulo;

        select.appendChild(option);
    });
}

async function cadastrarLivro() {

    await fetch("/livros", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            titulo: document.getElementById("titulo").value,
            autor: document.getElementById("autor").value,
            ano: document.getElementById("ano").value,
            quantidade: document.getElementById("quantidade").value
        })
    });

    carregarLivros();
}

async function excluirLivro(id) {

    await fetch(`/livros/${id}`, {
        method: "DELETE"
    });

    carregarLivros();
}

async function emprestarLivro() {

    await fetch("/emprestimos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario: document.getElementById("usuario").value,
            livro_id: document.getElementById("livroSelect").value
        })
    });

    carregarEmprestimos();
}

async function carregarEmprestimos() {

    const resposta = await fetch("/emprestimos");

    const emprestimos = await resposta.json();

    const lista = document.getElementById("listaEmprestimos");

    lista.innerHTML = "";

    emprestimos.forEach(item => {

        const li = document.createElement("li");

        li.innerHTML = `
      ${item.usuario} - ${item.titulo}
      (${item.status})

      ${item.status === "Emprestado"
                ? `<button onclick="devolver(${item.id})">Devolver</button>`
                : ""
            }
    `;

        lista.appendChild(li);
    });
}

async function devolver(id) {

    await fetch(`/emprestimos/${id}/devolver`, {
        method: "PUT"
    });

    carregarEmprestimos();
}

carregarLivros();
carregarEmprestimos();