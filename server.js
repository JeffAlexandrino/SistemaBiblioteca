const express = require("express");
const path = require("path");
const dbInstance = require("./src/config/database");
const LoanService = require("./src/services/loanService");
const StockObserver = require("./src/observers/stockObserver");
const NotificationObserver = require("./src/observers/notificationObserver");
const { ExternalEBook, EBookAdapter } = require("./src/models/itemAdapter");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// Configura o Observer
const loanService = new LoanService();
loanService.subscribe(new StockObserver());
loanService.subscribe(new NotificationObserver());

const db = dbInstance.getConnection();

// ─── HELPERS SIMPLIFICADOS ────────────────────────────────────────────────

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// ─── ROTAS ──────────────────────────────────────────────────────────────────

// LISTAR LIVROS
app.get("/livros", async (req, res) => {
    try {
        console.log("Buscando livros...");
        const rows = await dbAll("SELECT * FROM livros ORDER BY id DESC");
        console.log(`${rows.length} livros encontrados`);

        // Adiciona os E-books
        const externalData = [
            new ExternalEBook(1, "Design Patterns", "GoF", 1994),
            new ExternalEBook(2, "Clean Code", "Robert C. Martin", 2008)
        ];
        const adaptedEbooks = externalData.map(ebook => new EBookAdapter(ebook));

        res.json([...rows, ...adaptedEbooks]);
    } catch (err) {
        console.error("Erro:", err);
        res.status(500).json({ error: err.message });
    }
});

// CADASTRAR LIVRO
app.post("/livros", async (req, res) => {
    try {
        const { titulo, autor, ano, quantidade, disponivel_venda } = req.body;

        console.log("Cadastrando livro:", { titulo, autor, ano, quantidade, disponivel_venda });

        if (!titulo || !autor || !ano || !quantidade) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
        }

        const result = await dbRun(
            "INSERT INTO livros (titulo, autor, ano, quantidade, disponivel_venda) VALUES (?, ?, ?, ?, ?)",
            [titulo, autor, parseInt(ano), parseInt(quantidade), disponivel_venda || 0]
        );

        console.log("Livro cadastrado com ID:", result.lastID);
        res.json({ id: result.lastID, success: true });
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).json({ error: err.message });
    }
});

// EXCLUIR LIVRO
app.delete("/livros/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (id >= 9000) {
            return res.json({ success: true, message: "E-book removido da lista" });
        }

        await dbRun("DELETE FROM livros WHERE id = ?", [id]);
        console.log("🗑️ Livro excluído:", id);
        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao excluir:", err);
        res.status(500).json({ error: err.message });
    }
});

// LISTAR EMPRÉSTIMOS
app.get("/emprestimos", async (req, res) => {
    try {
        console.log("📋 Buscando empréstimos...");
        const emprestimos = await dbAll("SELECT * FROM emprestimos ORDER BY id DESC");
        const livros = await dbAll("SELECT id, titulo FROM livros");

        const resultado = emprestimos.map(emp => {
            let titulo = "Livro não encontrado";
            if (Number(emp.livro_id) >= 9000) {
                titulo = emp.livro_id === 9001 ? "[E-Book] Design Patterns" : "[E-Book] Clean Code";
            } else {
                const livro = livros.find(l => l.id === emp.livro_id);
                if (livro) titulo = livro.titulo;
            }
            return { ...emp, titulo };
        });

        res.json(resultado);
    } catch (err) {
        console.error("Erro:", err);
        res.status(500).json({ error: err.message });
    }
});

// REGISTRAR EMPRÉSTIMO
app.post("/emprestimos", async (req, res) => {
    try {
        const { usuario, livro_id } = req.body;

        console.log("Registrando empréstimo:", { usuario, livro_id });

        if (!usuario || !livro_id) {
            return res.status(400).json({ error: "Usuário e livro são obrigatórios!" });
        }

        // Verifica estoque (apenas para livros físicos)
        if (Number(livro_id) < 9000) {
            const livro = await dbGet(
                "SELECT id, quantidade, disponivel_venda FROM livros WHERE id = ?",
                [livro_id]
            );

            if (!livro) {
                return res.status(404).json({ error: "Livro não encontrado!" });
            }

            if (livro.quantidade < 1) {
                return res.status(400).json({ error: "Livro sem estoque disponível!" });
            }
        }

        // Determina o status
        let status = "Emprestado";
        if (Number(livro_id) < 9000) {
            const livro = await dbGet(
                "SELECT disponivel_venda FROM livros WHERE id = ?",
                [livro_id]
            );
            if (livro && livro.disponivel_venda === 1) {
                status = "Vendido";
            }
        }

        // Insere o empréstimo
        const result = await dbRun(
            "INSERT INTO emprestimos (usuario, livro_id, status) VALUES (?, ?, ?)",
            [usuario, livro_id, status]
        );

        console.log("✅ Empréstimo registrado ID:", result.lastID);

        // Notifica os observers (atualiza estoque)
        await loanService.notify("loan_created", { usuario, livro_id });

        res.json({ id: result.lastID, status, success: true });
    } catch (err) {
        console.error("Erro ao registrar empréstimo:", err);
        res.status(500).json({ error: err.message });
    }
});

// DEVOLVER LIVRO
app.put("/emprestimos/:id/devolver", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log("Devolvendo empréstimo ID:", id);

        // Busca o empréstimo
        const emprestimo = await dbGet(
            "SELECT id, livro_id, status FROM emprestimos WHERE id = ?",
            [id]
        );

        if (!emprestimo) {
            return res.status(404).json({ error: "Empréstimo não encontrado!" });
        }

        if (emprestimo.status === "Devolvido") {
            return res.status(400).json({ error: "Este livro já foi devolvido!" });
        }

        // Verifica se é venda
        if (Number(emprestimo.livro_id) < 9000) {
            const livro = await dbGet(
                "SELECT disponivel_venda FROM livros WHERE id = ?",
                [emprestimo.livro_id]
            );
            if (livro && livro.disponivel_venda === 1) {
                return res.status(400).json({
                    error: "Este livro foi VENDIDO e não pode ser devolvido!"
                });
            }
        }

        // Atualiza status
        await dbRun(
            "UPDATE emprestimos SET status = 'Devolvido' WHERE id = ?",
            [id]
        );

        console.log("Livro devolvido com sucesso");

        // Notifica observers (aumenta estoque)
        await loanService.notify("loan_returned", {
            usuario: emprestimo.usuario,
            livro_id: emprestimo.livro_id
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao devolver:", err);
        res.status(500).json({ error: err.message });
    }
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`\n Servidor rodando em http://localhost:${PORT}`);
    console.log(`Banco de dados: ${path.resolve(__dirname, "database.db")}\n`);
});