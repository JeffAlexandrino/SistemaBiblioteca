class ExternalEBook {
    constructor(id, name, writer, releaseYear) {
        this.id = id;
        this.name = name;
        this.writer = writer;
        this.releaseYear = releaseYear;
    }
}

class EBookAdapter {
    constructor(externalEBook) {
        this.id = 9000 + externalEBook.id;
        this.titulo = `[E-Book] ${externalEBook.name}`;
        this.autor = externalEBook.writer;
        this.ano = externalEBook.releaseYear;
        this.quantidade = 999;
    }
}

module.exports = { ExternalEBook, EBookAdapter };