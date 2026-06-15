# Sistema de Biblioteca - Evolução Arquitetural com Design Patterns

## Descrição do Sistema

Projeto desenvolvido para gerenciar livros e empréstimos de uma biblioteca. O sistema permite o cadastro de livros físicos, registro de empréstimos, devoluções e a consulta unificada das informações.

Desenvolvido como parte prática da Etapa 2 da disciplina de **Design Patterns**.

---

## Funcionalidades Implementadas

### Livros & Mídias Digitais
* Cadastro, listagem e exclusão de livros físicos locais (banco de dados).
* **Integração com Catálogo Externo:** Exibição unificada de mídias digitais (E-books) vindas de uma API externa simulada, utilizando o padrão *Adapter*.

### Empréstimos & Automações
* Registro de empréstimos e devoluções.
* **Gatilhos de Eventos Automatizados:** Atualização automática de estoque físico (`StockObserver`) e disparo de alertas/logs simulados de notificação de e-mail ao usuário (`NotificationObserver`) em tempo de execução através do padrão *Observer*.

---

## Tecnologias

### Frontend
* HTML5 (Estrutura baseada em tabelas limpas e semânticas)
* CSS3 (Layout moderno baseado em Cards)
* JavaScript (Consumo assíncrono de rotas via `fetch`)

### Backend
* Node.js
* Express

### Banco de Dados
* SQLite (`sqlite3`)

### Documentação
* Obsidian Notes
* Google Docs

---

## Arquitetura e Padrões de Projeto (Design Patterns)

A estrutura do backend foi inteiramente modularizada dentro do diretório `src/`, separando as responsabilidades e aplicando três padrões de projeto fundamentais de forma tecnicamente justificada:

### 1. Padrão Criacional: **Singleton**
* **Onde está:** `src/config/database.js`
* **Justificativa:** Centraliza a conexão com o arquivo físico do banco SQLite. Garante que uma única instância de conexão seja aberta, tratada e distribuída globalmente (protegida via `Object.freeze`), evitando múltiplas conexões concorrentes que gerariam travamento do arquivo (`database is locked`).

### 2. Padrão Estrutural: **Adapter**
* **Onde está:** `src/models/itemAdapter.js`
* **Justificativa:** Permite que o sistema consuma dados de mídias de uma API parceira externa (que utiliza propriedades em inglês como `name`, `writer`, `releaseYear` e não possui controle de estoque) e as converta em tempo de execução para o padrão esperado pelo frontend (`titulo`, `autor`, `ano`). Isola as regras externas sem espalhar blocos condicionais (`if/else`) no código principal.

### 3. Padrão Comportamental: **Observer (Publish-Subscribe)**
* **Onde está:** `src/services/loanService.js` (Subject) e a pasta `src/observers/`
* **Justificativa:** Desacopla o fluxo principal de registro de empréstimos das suas ações secundárias colaterais (baixa de estoque e envio de e-mails/notificações). Segue o princípio **Open/Closed (SOLID)**, permitindo que novas automações sejam acopladas ou removidas futuramente sem alterar a rota HTTP principal.

---

## Dificuldades Encontradas

* Configuração inicial do ambiente Node.js na primeira etapa.

## Evolução de Pontos Críticos (Antes e Depois)

No protótipo inicial (MVP), foram mapeados pontos com alto nível de acoplamento e de difícil manutenção. Abaixo está o registro de como esses problemas reais foram solucionados nesta segunda etapa do projeto:

* **Ponto Crítico Antigo:** A inclusão de novas regras de negócio (como mexer no estoque ou enviar alertas) exigiria alterações e códigos duplicados em vários pontos do sistema.
  * **O que foi feito/corrigido:** Implementação do padrão **Observer**. Agora, a rota de empréstimo apenas notifica o evento. A redução de estoque (`StockObserver`) e o alerta de confirmação (`NotificationObserver`) são classes isoladas e independentes. Adicionar uma nova regra no futuro não afeta o fluxo principal.
  
* **Ponto Crítico Antigo:** Falta de flexibilidade para trabalhar com dados externos ou novos formatos de mídia (como mídias digitais).
  * **O que foi feito/corrigido:** Implementação do padrão **Adapter**. Criamos uma camada que traduz os dados de sistemas parceiros externos em tempo de execução, permitindo que o frontend liste Livros Físicos e E-books na mesma interface de forma transparente.

* **Ponto Crítico Antigo:** Risco de concorrência e múltiplas conexões abertas no arquivo físico do SQLite por falta de centralização.
  * **O que foi feito/corrigido:** Criação do módulo de configuração de banco de dados utilizando o padrão **Singleton**, garantindo o reaproveitamento seguro de uma única instância de conexão por toda a aplicação.

---

## Ferramentas de IA Utilizadas

* **ChatGPT:** <br>
Auxílio na implementação e esclarecimento de dúvidas conceituais. <br>
Resolução de escopo e caminhos de arquivos em ambiente Linux.

---

## Estrutura do Projeto Atualizada

```text
SistemaBiblioteca/
├── .gitignore
├── database.db
├── package-lock.json
├── package.json
├── README.md
├── server.js (Roteador HTTP leve)
├── public/ (Frontend)
│   ├── index.html
│   ├── script.js
│   └── style.css
└── src/ (Backend)
    ├── config/
    │   └── database.js (Padrão Singleton)
    ├── models/
    │   └── itemAdapter.js (Padrão Adapter)
    ├── observers/
    │   ├── notificationObserver.js (Observador de Notificações)
    │   └── stockObserver.js (Observador de Estoque)
    └── services/
        └── loanService.js (Sujeito do Padrão Observer)