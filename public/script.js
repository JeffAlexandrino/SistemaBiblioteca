async function carregarLivros() {
    try {
        const resposta = await fetch("/livros");
        const livros = await resposta.json();

        const tabela = document.getElementById("corpoTabelaLivros");
        const select = document.getElementById("livroSelect");

        tabela.innerHTML = "";
        select.innerHTML = "";

        livros.forEach(livro => {
            const tr = document.createElement("tr");
            const tipo = livro.disponivel_venda === 1 ? "Venda" : "Empréstimo";

            tr.innerHTML = `
                <td>${livro.titulo || "Sem título"}</td>
                <td>${livro.autor || "Sem autor"}</td>
                <td>${livro.ano || "-"}</td>
                <td>${livro.quantidade !== undefined ? livro.quantidade : "∞"}</td>
                <td>
                    <span style="font-size:12px;background:#f0f0f0;padding:2px 8px;border-radius:10px;display:inline-block;margin-right:5px;">
                        ${tipo}
                    </span>
                    ${livro.id >= 9000 ? '' : `<button class="excluir" onclick="excluirLivro(${livro.id})">Excluir</button>`}
                </td>
            `;
            tabela.appendChild(tr);

            // Adiciona ao select (apenas com estoque)
            const option = document.createElement("option");
            option.value = livro.id;
            const temEstoque = livro.quantidade === undefined || livro.quantidade > 0;
            option.textContent = `${livro.titulo} ${temEstoque ? `(${livro.quantidade || '∞'})` : 'ESGOTADO'}`;
            option.disabled = !temEstoque;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar livros:", error);
        alert("Erro ao carregar livros. Verifique o console.");
    }
}

async function cadastrarLivro() {
    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const ano = document.getElementById("ano").value.trim();
    const quantidade = document.getElementById("quantidade").value.trim();
    const disponivelVenda = document.getElementById("disponivelVenda").checked ? 1 : 0;

    if (!titulo || !autor || !ano || !quantidade) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    if (parseInt(quantidade) < 1) {
        alert("A quantidade deve ser maior que 0!");
        return;
    }

    try {
        const response = await fetch("/livros", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo,
                autor,
                ano: parseInt(ano),
                quantidade: parseInt(quantidade),
                disponivel_venda: disponivelVenda
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Erro: " + error.error);
            return;
        }

        // Limpa os campos
        document.getElementById("titulo").value = "";
        document.getElementById("autor").value = "";
        document.getElementById("ano").value = "";
        document.getElementById("quantidade").value = "";
        document.getElementById("disponivelVenda").checked = false;

        alert("Livro cadastrado com sucesso!");
        await carregarLivros();
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao cadastrar livro");
    }
}

async function excluirLivro(id) {
    if (!confirm("Tem certeza que deseja excluir este livro?")) return;

    try {
        await fetch(`/livros/${id}`, { method: "DELETE" });
        await carregarLivros();
    } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir livro");
    }
}

async function emprestarLivro() {
    const usuario = document.getElementById("usuario").value.trim();
    const livro_id = document.getElementById("livroSelect").value;

    if (!usuario || !livro_id) {
        alert("Preencha o nome do usuário e selecione um livro!");
        return;
    }

    try {
        const response = await fetch("/emprestimos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario,
                livro_id: parseInt(livro_id)
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Erro: " + error.error);
            return;
        }

        const data = await response.json();
        alert(`${data.status === "Vendido" ? "Venda" : "Empréstimo"} registrado com sucesso!`);

        document.getElementById("usuario").value = "";
        await carregarEmprestimos();
        await carregarLivros();
    } catch (error) {
        console.error("Erro ao registrar:", error);
        alert("Erro ao registrar empréstimo");
    }
}

async function carregarEmprestimos() {
    try {
        const resposta = await fetch("/emprestimos");
        const emprestimos = await resposta.json();

        const tabela = document.getElementById("corpoTabelaEmprestimos");
        tabela.innerHTML = "";

        if (emprestimos.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#999;">Nenhum empréstimo registrado</td></tr>`;
            return;
        }

        emprestimos.forEach(item => {
            const tr = document.createElement("tr");
            const statusClass = item.status === "Emprestado" ? "status-emprestado"
                : item.status === "Vendido" ? "status-vendido"
                    : "status-devolvido";

            const podeDevolver = item.status === "Emprestado";

            tr.innerHTML = `
                <td>${item.usuario}</td>
                <td>${item.titulo}</td>
                <td><span class="status ${statusClass}">${item.status}</span></td>
                <td>
                    ${podeDevolver
                    ? `<button class="devolver" onclick="devolver(${item.id})">Devolver</button>`
                    : "—"}
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar empréstimos:", error);
    }
}

async function devolver(id) {
    if (!confirm("Deseja devolver este livro?")) return;

    try {
        const response = await fetch(`/emprestimos/${id}/devolver`, {
            method: "PUT"
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Erro: " + error.error);
            return;
        }

        alert("Livro devolvido com sucesso!");
        await carregarEmprestimos();
        await carregarLivros();
    } catch (error) {
        console.error("Erro ao devolver:", error);
        alert("Erro ao devolver livro");
    }
}

// Inicializa
carregarLivros();
carregarEmprestimos();