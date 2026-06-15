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

// LIVROS
app.get("/livros", (req, res) => {
    db.all("SELECT * FROM livros", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const externalData = [
            new ExternalEBook(1, "Design Patterns", "GoF", 1994),
            new ExternalEBook(2, "Clean Code", "Robert C. Martin", 2008)
        ];

        const adaptedEbooks = externalData.map(ebook => new EBookAdapter(ebook));
        res.json([...rows, ...adaptedEbooks]);
    });
});

app.post("/livros", (req, res) => {
    const { titulo, autor, ano, quantidade } = req.body;
    db.run(
        "INSERT INTO livros(titulo, autor, ano, quantidade) VALUES (?, ?, ?, ?)",
        [titulo, autor, ano, quantidade],
        function () {
            res.json({ id: this.lastID });
        }
    );
});

app.delete("/livros/:id", (req, res) => {
    // Se o ID for de um E-Book (faixa dos 9000), o frontend apenas finge que deleta
    if (Number(req.params.id) >= 9000) {
        return res.json({ sucesso: true });
    }
    db.run("DELETE FROM livros WHERE id = ?", [req.params.id], () => {
        res.json({ sucesso: true });
    });
});

// EMPRÉSTIMOS
app.get("/emprestimos", (req, res) => {
    db.all("SELECT * FROM emprestimos", [], (err, emprestimos) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all("SELECT id, titulo FROM livros", [], (err, livros) => {
            if (err) return res.status(500).json({ error: err.message });

            const listaMapeada = emprestimos.map(emp => {
                let livroCorrespondente = livros.find(l => l.id === Number(emp.livro_id));
                let titulo = livroCorrespondente ? livroCorrespondente.titulo : "Item Digital (Acesso Online)";

                if (Number(emp.livro_id) === 9001) titulo = "[E-Book] Design Patterns";
                if (Number(emp.livro_id) === 9002) titulo = "[E-Book] Clean Code";

                return {
                    id: emp.id,
                    usuario: emp.usuario,
                    status: emp.status,
                    titulo: titulo
                };
            });

            res.json(listaMapeada);
        });
    });
});

app.post("/emprestimos", (req, res) => {
    const { usuario, livro_id } = req.body;

    db.run(
        "INSERT INTO emprestimos(usuario, livro_id, status) VALUES (?, ?, 'Emprestado')",
        [usuario, livro_id],
        function () {
            // Dispara o padrão Observer para atualizar estoque e mandar e-mail fictício
            loanService.notify("loan_created", { usuario, livro_id });
            res.json({ id: this.lastID });
        }
    );
});

app.put("/emprestimos/:id/devolver", (req, res) => {
    db.run("UPDATE emprestimos SET status = 'Devolvido' WHERE id = ?", [req.params.id], () => {
        res.json({ sucesso: true });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});