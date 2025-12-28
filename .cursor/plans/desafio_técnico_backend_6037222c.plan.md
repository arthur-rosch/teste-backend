---
name: Desafio Técnico Backend
overview: Implementação completa do desafio técnico backend com Node.js, Express, Mongoose e TypeScript, organizada em checkpoints commitáveis seguindo commit lint, incluindo autenticação JWT, gestão de pedidos com validações e testes unitários.
todos:
  - id: setup
    content: Configurar projeto inicial (package.json, tsconfig, estrutura de pastas)
    status: pending
  - id: express-mongoose
    content: Configurar Express e conexão Mongoose
    status: pending
    dependencies:
      - setup
  - id: user-auth
    content: Implementar modelo User e autenticação (registro/login com JWT)
    status: pending
    dependencies:
      - express-mongoose
  - id: auth-middleware
    content: Criar middleware de autenticação JWT
    status: pending
    dependencies:
      - user-auth
  - id: order-model
    content: Criar modelo Order com schema completo
    status: pending
    dependencies:
      - express-mongoose
  - id: orders-crud
    content: Implementar POST /orders e GET /orders com paginação
    status: pending
    dependencies:
      - order-model
      - auth-middleware
  - id: validations
    content: Adicionar validações de negócio (services obrigatório, valor > 0)
    status: pending
    dependencies:
      - orders-crud
  - id: state-advancement
    content: Implementar PATCH /orders/:id/advance com validação de transições
    status: pending
    dependencies:
      - orders-crud
  - id: tests
    content: Criar testes unitários com Vitest para transições de estado
    status: pending
    dependencies:
      - state-advancement
  - id: docs
    content: Criar README com instruções de execução
    status: pending
    dependencies:
      - tests
---

# Desafio Téc

nico Backend - Plano de Implementação

## Estrutura do Projeto

Estrutura simples e direta:

```javascript
/src
  /controllers
  /models
  /routes
  /services
  /middlewares
  /utils
  /types
/tests
```



## Checkpoints (Commits)

### Checkpoint 1: Configuração Inicial

- `package.json` com dependências (express, mongoose, jsonwebtoken, bcryptjs, dotenv, vitest, etc)
- `tsconfig.json` configurado
- `.gitignore` e `.env.example`
- Estrutura básica de pastas
- Commit: `chore: initial project setup with dependencies and tsconfig`

### Checkpoint 2: Configuração Base Express e Mongoose

- `src/app.ts` - Configuração do Express
- `src/server.ts` - Servidor HTTP
- `src/config/database.ts` - Conexão com MongoDB via Mongoose
- Configuração de variáveis de ambiente
- Commit: `feat: setup express server and mongoose connection`

### Checkpoint 3: Modelo User e Autenticação Base

- `src/models/User.ts` - Schema do Mongoose para User (email único, password)
- `src/routes/auth.routes.ts` - Rotas de autenticação
- `src/controllers/auth.controller.ts` - Lógica de registro e login
- `src/services/auth.service.ts` - Serviço de autenticação (hash de senha, geração de JWT)
- Commit: `feat: add user model and authentication (register/login)`

### Checkpoint 4: Middleware de Autenticação

- `src/middlewares/auth.middleware.ts` - Verificação de JWT
- Proteção de rotas de pedidos
- Commit: `feat: add JWT authentication middleware`

### Checkpoint 5: Modelo Order

- `src/models/Order.ts` - Schema do Mongoose para Order
- Campos: lab, patient, customer (strings)
- state: CREATED | ANALYSIS | COMPLETED (enum)
- status: ACTIVE | DELETED (enum)
- services: Array com { name, value, status: PENDING | DONE }
- Validações no schema (services obrigatório)
- Commit: `feat: add order model with state and services`

### Checkpoint 6: CRUD Básico de Orders (ETAPA 1)

- `src/routes/orders.routes.ts` - Rotas de pedidos
- `src/controllers/orders.controller.ts` - Controllers
- `src/services/orders.service.ts` - Lógica de negócio
- POST /orders - Criação (state: CREATED, status: ACTIVE)
- GET /orders - Listagem com paginação e filtro por state
- Commit: `feat: implement basic orders CRUD (POST and GET with pagination)`

### Checkpoint 7: Validações de Negócio (ETAPA 2)

- Validação: não permitir pedidos sem serviços
- Validação: não permitir valor total zerado
- Middleware de validação ou validação no service
- Commit: `feat: add business validations for order creation`

### Checkpoint 8: Endpoint de Avanço de Estado

- PATCH /orders/:id/advance - Avança o state do pedido
- Lógica de transição: CREATED → ANALYSIS → COMPLETED
- Bloqueio de tentativas de pular etapas ou retroceder
- Validação de estados válidos
- Commit: `feat: add order state advancement endpoint with strict validation`

### Checkpoint 9: Testes Unitários (ETAPA 2 - Diferencial)

- Configuração do Vitest
- Testes para transição de estados (bloqueio de ações inválidas)
- Testes para validações de negócio
- Testes para autenticação (opcional mas recomendado)
- Commit: `test: add unit tests for order state transitions and validations`

### Checkpoint 10: Documentação e Finalização

- `README.md` com instruções de execução
- Variáveis de ambiente necessárias
- Como rodar os testes
- Endpoints disponíveis
- Commit: `docs: add README with setup and execution instructions`

## Detalhes Técnicos Importantes

### Autenticação

- JWT com expiração configurável
- Senhas hasheadas com bcrypt
- Middleware reutilizável para proteção de rotas

### Orders

- Paginação com `page` e `limit` na query string
- Filtro por `state` na query string
- Cálculo automático do valor total dos serviços
- Estado inicial sempre CREATED e status ACTIVE

### Validações

- Services array obrigatório e não vazio
- Valor total > 0
- Transições de estado apenas na ordem estrita
- Validação de propriedade do pedido (só o criador pode avançar?)

### Testes

- Foco na lógica de transição de estados
- Testes de bloqueio de transições inválidas
- Mock do Mongoose quando necessário