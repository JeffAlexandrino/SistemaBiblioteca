const dbInstance = require("../config/database");

class StockObserver {
    update(event, data) {
        // Se for um E-book (ID fictício na faixa dos 9000), não mexe no estoque físico
        if (Number(data.livro_id) >= 9000) return;

        if (event === "loan_created") {
            const db = dbInstance.getConnection();
            db.run(
                "UPDATE livros SET quantidade = quantidade - 1 WHERE id = ? AND quantidade > 0",
                [data.livro_id]
            );
        }
    }
}

module.exports = StockObserver;