# Backend API

API RESTful desenvolvida com Node.js, Express, MongoDB e TypeScript para gestão de pedidos com autenticação JWT.

## Tecnologias

- Node.js
- Express
- MongoDB + Mongoose
- TypeScript
- JWT (autenticação)
- Zod (validação)
- Vitest (testes)

## Requisitos

- Node.js 18+
- MongoDB 6+

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```env
# Server Port (default: 3000)
PORT=3000

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/teste-backend

# JWT Secret Key (required - minimum 1 character)
JWT_SECRET=your-secret-key-here-change-in-production

# JWT Token Expiration Time (default: 7d)
# Examples: 1h, 24h, 7d, 30d
JWT_EXPIRES_IN=7d
```

### Descrição das Variáveis

- **PORT**: Porta em que o servidor irá rodar (padrão: 3000)
- **MONGODB_URI**: URI de conexão com o MongoDB (obrigatório, deve ser uma URL válida)
- **JWT_SECRET**: Chave secreta usada para assinar os tokens JWT (obrigatório, mínimo de 1 caractere)
- **JWT_EXPIRES_IN**: Tempo de expiração dos tokens JWT (padrão: 7d). Aceita formatos como: `1h`, `24h`, `7d`, `30d`

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes

**Executar todos os testes**
```bash
npm test
```

**Executar com interface gráfica**
```bash
npm run test:ui
```

**Estrutura de testes:**
- `tests/auth.service.test.ts` - Testes unitários do serviço de autenticação
- `tests/orders.service.test.ts` - Testes unitários do serviço de pedidos
- `tests/e2e/auth.e2e.test.ts` - Testes E2E dos endpoints de autenticação
- `tests/e2e/orders.e2e.test.ts` - Testes E2E dos endpoints de pedidos

## Endpoints

### Autenticação

**POST /auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST /auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Pedidos (requer autenticação)

**POST /orders**
```json
{
  "lab": "Lab Name",
  "patient": "Patient Name",
  "customer": "Customer Name",
  "services": [
    {
      "name": "Service 1",
      "value": 100.50
    }
  ]
}
```

**GET /orders**

Query params:
- `page` (default: 1)
- `limit` (default: 10)
- `state` (optional: CREATED, ANALYSIS, COMPLETED)

**PATCH /orders/:id/advance**

Avança o estado do pedido: CREATED → ANALYSIS → COMPLETED

## Regras de Negócio

- Pedidos devem ter pelo menos um serviço
- Valor total do pedido deve ser maior que zero
- Estados avançam apenas na ordem: CREATED → ANALYSIS → COMPLETED
- Não é permitido pular ou retroceder estados
- Pedidos concluídos não podem ser avançados

## Autenticação

Todas as rotas de pedidos requerem autenticação via JWT. Inclua o token no header:

```
Authorization: Bearer {token}
```
