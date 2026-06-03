# Sistema de Biblioteca - MVP

## Descrição do Sistema

Projeto simples desenvolvido para gerenciar livros e empréstimos de uma biblioteca. O sistema permite o cadastro de livros, registro de empréstimos e devoluções, além da consulta das informações cadastradas.

Desenvolvido como parte da disciplina de Design Patterns.

---

## Funcionalidades Implementadas

### Livros

* Cadastro de livros
* Listagem de livros cadastrados
* Exclusão de livros

### Empréstimos

* Registro de empréstimos
* Registro de devoluções
* Listagem de empréstimos realizados

---

## Tecnologias

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express

### Banco de Dados

* SQLite

---

## Dificuldades Encontradas

* Configuração inicial do ambiente Node.js.

---

## Pontos do Sistema que Parecem Difíceis de Manter ou Expandir

* A inclusão de novas funcionalidades pode exigir alterações em vários pontos do sistema.

---

## Ferramentas de IA Utilizadas

* ChatGPT (OpenAI): auxílio na implementação e esclarecimento de dúvidas durante o desenvolvimento.

---

## Instruções de Execução

### Pré-requisitos

* Node.js instalado
* NPM instalado

### Instalação

Clone o repositório:

```bash
git clone https://github.com/JeffAlexandrino/SistemaBiblioteca.git
```

Acesse a pasta do projeto:

```bash
cd SistemaBiblioteca
```

Instale as dependências:

```bash
npm install
```

### Execução

Inicie o servidor:

```bash
node server.js
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

---

## Estrutura do Projeto

```text
SistemaBiblioteca/
│
├── server.js
├── package.json
├── database.db
├── README.md
│
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

---

## Integrantes

* Jefferson Barzan Alexandrino
