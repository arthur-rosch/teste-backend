#!/bin/bash

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testando API Backend ===${NC}\n"

# Check if server is running
echo -e "${BLUE}Verificando se o servidor está rodando...${NC}"
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo -e "${RED}❌ Servidor não está respondendo em http://localhost:3000${NC}"
  echo -e "${YELLOW}Por favor, inicie o servidor em outro terminal com:${NC}"
  echo -e "${GREEN}  pnpm dev${NC}\n"
  exit 1
fi

echo -e "${GREEN}✅ Servidor está rodando!${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Health Check${NC}"
response=$(curl -s -w "\n%{http_code}" http://localhost:3000/health 2>&1)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Status: $http_code${NC}"
else
  echo -e "${RED}❌ Status: $http_code${NC}"
  echo -e "${RED}Erro de conexão. Verifique se o servidor está rodando.${NC}"
  exit 1
fi
echo "Response: $body"
echo ""

# Test 2: Register User
echo -e "${YELLOW}2. Registro de Usuário${NC}"
register_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
register_code=$(echo "$register_response" | tail -n1)
register_body=$(echo "$register_response" | sed '$d')
echo "Status: $register_code"
echo "Response: $register_body"
echo ""

# Extract token
TOKEN=$(echo "$register_body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Erro: Token não encontrado. Tentando login...${NC}"
  
  # Try login
  login_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')
  login_code=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  TOKEN=$(echo "$login_body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Login Status: $login_code"
  echo "Login Response: $login_body"
  echo ""
fi

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Erro: Não foi possível obter token. Abortando testes...${NC}"
  exit 1
fi

echo -e "${GREEN}Token obtido: ${TOKEN:0:20}...${NC}\n"

# Test 3: Create Order
echo -e "${YELLOW}3. Criar Pedido${NC}"
order_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "lab": "Lab Test",
    "patient": "Patient Test",
    "customer": "Customer Test",
    "services": [
      {
        "name": "Service 1",
        "value": 100.50
      },
      {
        "name": "Service 2",
        "value": 200.00
      }
    ]
  }')
order_code=$(echo "$order_response" | tail -n1)
order_body=$(echo "$order_response" | sed '$d')
echo "Status: $order_code"
echo "Response: $order_body"
echo ""

# Extract order ID
ORDER_ID=$(echo "$order_body" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$ORDER_ID" ]; then
  echo -e "${RED}Erro: Order ID não encontrado${NC}"
else
  echo -e "${GREEN}Order ID: $ORDER_ID${NC}\n"
  
  # Test 4: List Orders
  echo -e "${YELLOW}4. Listar Pedidos${NC}"
  list_response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/orders?page=1&limit=10" \
    -H "Authorization: Bearer $TOKEN")
  list_code=$(echo "$list_response" | tail -n1)
  list_body=$(echo "$list_response" | sed '$d')
  echo "Status: $list_code"
  echo "Response: $list_body"
  echo ""
  
  # Test 5: Advance Order State (CREATED -> ANALYSIS)
  echo -e "${YELLOW}5. Avançar Estado: CREATED -> ANALYSIS${NC}"
  advance1_response=$(curl -s -w "\n%{http_code}" -X PATCH "http://localhost:3000/orders/$ORDER_ID/advance" \
    -H "Authorization: Bearer $TOKEN")
  advance1_code=$(echo "$advance1_response" | tail -n1)
  advance1_body=$(echo "$advance1_response" | sed '$d')
  echo "Status: $advance1_code"
  echo "Response: $advance1_body"
  echo ""
  
  # Test 6: Advance Order State (ANALYSIS -> COMPLETED)
  echo -e "${YELLOW}6. Avançar Estado: ANALYSIS -> COMPLETED${NC}"
  advance2_response=$(curl -s -w "\n%{http_code}" -X PATCH "http://localhost:3000/orders/$ORDER_ID/advance" \
    -H "Authorization: Bearer $TOKEN")
  advance2_code=$(echo "$advance2_response" | tail -n1)
  advance2_body=$(echo "$advance2_response" | sed '$d')
  echo "Status: $advance2_code"
  echo "Response: $advance2_body"
  echo ""
  
  # Test 7: Try to advance COMPLETED order (should fail)
  echo -e "${YELLOW}7. Tentar Avançar Pedido COMPLETED (deve falhar)${NC}"
  advance3_response=$(curl -s -w "\n%{http_code}" -X PATCH "http://localhost:3000/orders/$ORDER_ID/advance" \
    -H "Authorization: Bearer $TOKEN")
  advance3_code=$(echo "$advance3_response" | tail -n1)
  advance3_body=$(echo "$advance3_response" | sed '$d')
  echo "Status: $advance3_code"
  echo "Response: $advance3_body"
  echo ""
fi

# Test 8: List Orders with state filter
echo -e "${YELLOW}8. Listar Pedidos com Filtro (state: CREATED)${NC}"
filter_response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/orders?state=CREATED&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN")
filter_code=$(echo "$filter_response" | tail -n1)
filter_body=$(echo "$filter_response" | sed '$d')
echo "Status: $filter_code"
echo "Response: $filter_body"
echo ""

# Test 9: Test validation - empty services (should fail)
echo -e "${YELLOW}9. Testar Validação: Array de Serviços Vazio (deve falhar)${NC}"
validation1_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "lab": "Lab Test",
    "patient": "Patient Test",
    "customer": "Customer Test",
    "services": []
  }')
validation1_code=$(echo "$validation1_response" | tail -n1)
validation1_body=$(echo "$validation1_response" | sed '$d')
echo "Status: $validation1_code"
echo "Response: $validation1_body"
echo ""

# Test 10: Test validation - zero value (should fail)
echo -e "${YELLOW}10. Testar Validação: Valor Zero (deve falhar)${NC}"
validation2_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "lab": "Lab Test",
    "patient": "Patient Test",
    "customer": "Customer Test",
    "services": [
      {
        "name": "Service 1",
        "value": 0
      }
    ]
  }')
validation2_code=$(echo "$validation2_response" | tail -n1)
validation2_body=$(echo "$validation2_response" | sed '$d')
echo "Status: $validation2_code"
echo "Response: $validation2_body"
echo ""

echo -e "${GREEN}=== Testes Concluídos ===${NC}"

