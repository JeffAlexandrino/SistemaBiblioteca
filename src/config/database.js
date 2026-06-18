const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
    constructor() {
        if (!Database.instance) {
            const dbPath = path.resolve(__dirname, "../../database.db");
            console.log("Banco de dados em:", dbPath);

            this.connection = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error("Erro ao conectar ao banco:", err.message);
                } else {
                    console.log("Banco de dados conectado com sucesso!");
                }
            });

            this.init();
            Database.instance = this;
        }
        return Database.instance;
    }

    init() {
        this.connection.serialize(() => {
            this.connection.run(`
                CREATE TABLE IF NOT EXISTS livros (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL,
                    autor TEXT NOT NULL,
                    ano INTEGER NOT NULL,
                    quantidade INTEGER NOT NULL DEFAULT 0,
                    disponivel_venda INTEGER DEFAULT 0
                )
            `, (err) => {
                if (err) console.error("Erro ao criar tabela livros:", err);
                else console.log("Tabela 'livros' pronta");
            });

            this.connection.run(`
                CREATE TABLE IF NOT EXISTS emprestimos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario TEXT NOT NULL,
                    livro_id INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error("Erro ao criar tabela emprestimos:", err);
                else console.log("Tabela 'emprestimos' pronta");
            });
        });
    }

    getConnection() {
        return this.connection;
    }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;