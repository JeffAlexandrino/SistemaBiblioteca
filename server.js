const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./database.db");

// Criação das tabelas
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      autor TEXT,
      ano INTEGER,
      quantidade INTEGER
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS emprestimos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT,
      livro_id INTEGER,
      status TEXT
    )
  `);
});


// LIVROS

app.get("/livros", (req, res) => {
    db.all("SELECT * FROM livros", [], (err, rows) => {
        res.json(rows);
    });
});

app.post("/livros", (req, res) => {
    const { titulo, autor, ano, quantidade } = req.body;

    db.run(
        "INSERT INTO livros(titulo, autor, ano, quantidade) VALUES (?, ?, ?, ?)",
        [titulo, autor, ano, quantidade],
        function (err) {
            res.json({ id: this.lastID });
        }
    );
});

app.delete("/livros/:id", (req, res) => {
    db.run(
        "DELETE FROM livros WHERE id = ?",
        [req.params.id],
        () => {
            res.json({ sucesso: true });
        }
    );
});


// EMPRESTIMOS

app.get("/emprestimos", (req, res) => {
    db.all(`
    SELECT e.id,
           e.usuario,
           e.status,
           l.titulo
    FROM emprestimos e
    JOIN livros l ON l.id = e.livro_id
  `, [], (err, rows) => {
        res.json(rows);
    });
});

app.post("/emprestimos", (req, res) => {
    const { usuario, livro_id } = req.body;

    db.run(
        "INSERT INTO emprestimos(usuario, livro_id, status) VALUES (?, ?, 'Emprestado')",
        [usuario, livro_id],
        function () {
            res.json({ id: this.lastID });
        }
    );
});

app.put("/emprestimos/:id/devolver", (req, res) => {
    db.run(
        "UPDATE emprestimos SET status='Devolvido' WHERE id=?",
        [req.params.id],
        () => {
            res.json({ sucesso: true });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});