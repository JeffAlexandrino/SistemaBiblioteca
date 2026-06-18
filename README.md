# Sistema de Biblioteca - Evolução Arquitetural com Design Patterns

## Descrição do Sistema

Projeto desenvolvido para gerenciar livros e empréstimos de uma biblioteca. O sistema permite o cadastro de livros físicos, registro de empréstimos, devoluções e a consulta unificada das informações.

Desenvolvido como projeto final da disciplina de **Design Patterns**.

---

## Funcionalidades Implementadas

### Livros & Mídias Digitais
- Cadastro, listagem e exclusão de livros físicos locais (banco de dados SQLite)
- **Integração com Catálogo Externo:** Exibição unificada de mídias digitais (E-books) vindas de uma API externa simulada, utilizando o padrão *Adapter*
- **Controle de Estoque:** Atualização automática do estoque ao realizar empréstimos e devoluções
- **Modalidades:** Livros podem ser cadastrados como "Empréstimo" ou "Venda"

### Empréstimos & Automações
- Registro de empréstimos e devoluções
- Livros marcados como "Venda" não podem ser devolvidos (compra finalizada)
- **Gatilhos de Eventos Automatizados:** Atualização automática de estoque físico (`StockObserver`) e disparo de alertas/logs simulados de notificação de e-mail ao usuário (`NotificationObserver`) em tempo de execução através do padrão *Observer*

---

## Tecnologias

### Frontend
- HTML5 (Estrutura baseada em tabelas limpas e semânticas)
- CSS3 (Layout moderno baseado em Cards com variáveis CSS)
- JavaScript (Consumo assíncrono de rotas via `fetch`)

### Backend
- Node.js
- Express

### Banco de Dados
- SQLite (`sqlite3`)

---

## Arquitetura e Padrões de Projeto (Design Patterns)

A estrutura do backend foi inteiramente modularizada dentro do diretório `src/`, separando as responsabilidades e aplicando três padrões de projeto fundamentais de forma tecnicamente justificada:

### 1. Padrão Criacional: **Singleton**
- **Onde está:** `src/config/database.js`
- **Justificativa:** Centraliza a conexão com o arquivo físico do banco SQLite. Garante que uma única instância de conexão seja aberta, tratada e distribuída globalmente (protegida via `Object.freeze`), evitando múltiplas conexões concorrentes que gerariam travamento do arquivo (`database is locked`).
- **Benefício:** Controle centralizado, redução de consumo de memória e prevenção de conflitos de acesso.

### 2. Padrão Estrutural: **Adapter**
- **Onde está:** `src/models/itemAdapter.js`
- **Justificativa:** Permite que o sistema consuma dados de mídias de uma API parceira externa (que utiliza propriedades em inglês como `name`, `writer`, `releaseYear` e não possui controle de estoque) e as converta em tempo de execução para o padrão esperado pelo frontend (`titulo`, `autor`, `ano`). Isola as regras externas sem espalhar blocos condicionais (`if/else`) no código principal.
- **Benefício:** Isolamento da integração externa, reutilização do frontend existente e uniformização da representação dos itens.

### 3. Padrão Comportamental: **Observer (Publish-Subscribe)**
- **Onde está:** `src/services/loanService.js` (Subject) e a pasta `src/observers/`
- **Justificativa:** Desacopla o fluxo principal de registro de empréstimos das suas ações secundárias colaterais (baixa de estoque e envio de e-mails/notificações). Segue o princípio **Open/Closed (SOLID)**, permitindo que novas automações sejam acopladas ou removidas futuramente sem alterar a rota HTTP principal.
- **Benefício:** Desacoplamento entre eventos e ações, facilidade para adicionar novas funcionalidades e melhor separação de responsabilidades.

---

## Dificuldades Encontradas

- Configuração inicial do ambiente Node.js na primeira etapa
- Ajuste fino do controle de estoque para livros de venda vs. empréstimo
- Configuração do caminho correto do banco de dados SQLite

---

## Evolução de Pontos Críticos (Antes e Depois)

No protótipo inicial (MVP), foram mapeados pontos com alto nível de acoplamento e de difícil manutenção. Abaixo está o registro de como esses problemas reais foram solucionados nesta segunda etapa do projeto:

### Ponto Crítico 1: Lógica de Negócio Acoplada
- **Antes:** A inclusão de novas regras de negócio (como mexer no estoque ou enviar alertas) exigiria alterações e códigos duplicados em vários pontos do sistema.
- **Depois:** Implementação do padrão **Observer**. Agora, a rota de empréstimo apenas notifica o evento. A redução de estoque (`StockObserver`) e o alerta de confirmação (`NotificationObserver`) são classes isoladas e independentes. Adicionar uma nova regra no futuro não afeta o fluxo principal.

### Ponto Crítico 2: Integração com Dados Externos
- **Antes:** Falta de flexibilidade para trabalhar com dados externos ou novos formatos de mídia (como mídias digitais).
- **Depois:** Implementação do padrão **Adapter**. Criamos uma camada que traduz os dados de sistemas parceiros externos em tempo de execução, permitindo que o frontend liste Livros Físicos e E-books na mesma interface de forma transparente.

### Ponto Crítico 3: Gerenciamento de Conexão
- **Antes:** Risco de concorrência e múltiplas conexões abertas no arquivo físico do SQLite por falta de centralização.
- **Depois:** Criação do módulo de configuração de banco de dados utilizando o padrão **Singleton**, garantindo o reaproveitamento seguro de uma única instância de conexão por toda a aplicação.

---

## Comportamento do Sistema

### Livros de Empréstimo (disponivel_venda = 0)
- ✅ Podem ser emprestados
- ✅ Estoque diminui ao emprestar
- ✅ Podem ser devolvidos
- ✅ Estoque aumenta ao devolver

### Livros de Venda (disponivel_venda = 1)
- ✅ Podem ser vendidos
- ✅ Estoque diminui ao vender
- ❌ NÃO podem ser devolvidos
- ❌ Estoque NÃO aumenta (venda é definitiva)

### E-books (ID >= 9000)
- ✅ São exibidos na lista
- ❌ Não têm controle de estoque
- ❌ Não podem ser emprestados (apenas "comprados" conceitualmente)
- ❌ Não podem ser devolvidos
```

## Ferramentas de IA Utilizadas

- **ChatGPT:** Auxílio na implementação e esclarecimento de dúvidas conceituais. Resolução de escopo e caminhos de arquivos em ambiente Linux. Correção de bugs relacionados ao controle de estoque e devolução de livros.

---

## Instruções de Execução

### Pré-requisitos
- Node.js instalado (versão 14 ou superior)
- NPM instalado

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/JeffAlexandrino/SistemaBiblioteca.git
```

2. Acesse a pasta do projeto:
```bash
cd SistemaBiblioteca
```

3. Instale as dependências:
```bash
npm install
```

### Execução

Inicie o servidor a partir do arquivo central na raiz:
```bash
node server.js
```

A aplicação estará disponível no navegador em:
```
http://localhost:3000
```

### Testando o Sistema

1. **Cadastrar um livro:** Preencha os campos e selecione se é para "Venda" ou "Empréstimo"
2. **Realizar empréstimo/venda:** Selecione um usuário e um livro disponível
3. **Devolver:** Apenas livros de "Empréstimo" podem ser devolvidos
4. **E-books:** Dois e-books estão disponíveis como exemplo de integração externa

---

## Estrutura Final do Projeto

```
SistemaBiblioteca/
├── .gitignore
├── database.db                      # Banco de dados SQLite (criado automaticamente)
├── package-lock.json
├── package.json
├── README.md
├── server.js                        # Servidor Express com rotas
├── public/                          # Frontend
│   ├── index.html
│   ├── script.js                    # Lógica do cliente
│   └── style.css                    # Estilos CSS
└── src/                             # Backend modularizado
    ├── config/
    │   └── database.js              # Padrão Singleton
    ├── models/
    │   └── itemAdapter.js           # Padrão Adapter
    ├── observers/
    │   ├── notificationObserver.js  # Observador de Notificações
    │   └── stockObserver.js         # Observador de Estoque
    └── services/
        └── loanService.js           # Sujeito do Padrão Observer
```