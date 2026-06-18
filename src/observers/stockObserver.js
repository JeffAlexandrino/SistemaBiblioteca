const dbInstance = require("../config/database");

function dbRun(db, sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function dbGet(db, sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

class StockObserver {
    async update(event, data) {
        const livroId = Number(data.livro_id);

        // E-books (ID >= 9000) não têm estoque no banco
        if (livroId >= 9000) {
            console.log(`E-book ID ${livroId} - sem controle de estoque`);
            return;
        }

        const db = dbInstance.getConnection();

        if (event === "loan_created") {
            console.log(`[StockObserver] Reduzindo estoque do livro ${livroId}`);

            const result = await dbRun(db,
                "UPDATE livros SET quantidade = quantidade - 1 WHERE id = ? AND quantidade > 0",
                [livroId]
            );

            if (result.changes === 0) {
                console.warn(`Estoque já zerado para o livro ${livroId}`);
            } else {
                console.log(`Estoque reduzido com sucesso`);
            }

        } else if (event === "loan_returned") {
            console.log(`[StockObserver] Verificando devolução do livro ${livroId}`);

            // Verifica se é venda
            const livro = await dbGet(db,
                "SELECT disponivel_venda FROM livros WHERE id = ?",
                [livroId]
            );

            if (livro && livro.disponivel_venda === 1) {
                console.log(`Livro ${livroId} é de VENDA - estoque NÃO será restaurado`);
                return;
            }

            // Aumenta o estoque
            await dbRun(db,
                "UPDATE livros SET quantidade = quantidade + 1 WHERE id = ?",
                [livroId]
            );
            console.log(`Estoque restaurado para o livro ${livroId}`);
        }
    }
}

module.exports = StockObserver;