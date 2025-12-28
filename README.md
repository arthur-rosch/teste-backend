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

Crie um arquivo `.env` baseado no `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/teste-backend
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

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
```bash
npm test
```

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
