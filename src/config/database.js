const sqlite3 = require("sqlite3").verbose();

class Database {
    constructor() {
        if (!Database.instance) {
            this.connection = new sqlite3.Database("./database.db");
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
                  titulo TEXT,
                  autor TEXT,
                  ano INTEGER,
                  quantidade INTEGER
                )
            `);
            this.connection.run(`
                CREATE TABLE IF NOT EXISTS emprestimos (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  usuario TEXT,
                  livro_id TEXT, -- Mudamos para TEXT para aceitar os IDs dos e-books digitais!
                  status TEXT
                )
            `);
        });
    }

    getConnection() {
        return this.connection;
    }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;