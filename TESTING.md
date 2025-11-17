# Guia de Testes - Microsserviço Lessons

Este documento explica como executar os testes do microsserviço de Lessons.

## 📋 Pré-requisitos

1. **Docker e Docker Compose** instalados e rodando
2. **Node.js** e **npm** instalados
3. **PostgreSQL** rodando (via Docker Compose)
4. **OAuth service** rodando (via Docker Compose)

## 🚀 Configuração Inicial

### 1. Iniciar os serviços necessários

```bash
# Na raiz do projeto
cd /home/gabrielteiga/faculdade/25-2/constrsw/base

# Iniciar PostgreSQL e OAuth
docker-compose up -d postgresql oauth

# Aguardar os serviços ficarem saudáveis (cerca de 30 segundos)
docker-compose ps
```

### 2. Criar o banco de dados de teste (se não existir)

```bash
# Conectar ao PostgreSQL e criar o banco
docker-compose exec -T postgresql psql -U postgres -c "CREATE DATABASE lessons_db;" 2>&1 || echo "Database may already exist"
```

### 3. Executar as migrações do Prisma

```bash
cd backend/lessons

# Configurar DATABASE_URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lessons_db"

# Executar migrações
npx prisma db push --skip-generate
```

## 🧪 Executando os Testes

### Testes Unitários

Os testes unitários testam os controllers isoladamente, mockando os serviços.

```bash
cd backend/lessons

# Executar todos os testes unitários
npm test

# Executar apenas testes de controllers
npm test -- --testPathPatterns="controller.spec"

# Executar com cobertura
npm run test:cov

# Executar em modo watch (re-executa quando arquivos mudam)
npm run test:watch
```

**Resultado esperado:**
```
PASS src/lesson/lesson.controller.spec.ts
PASS src/subject/subject.controller.spec.ts
Test Suites: 2 passed, 2 total
Tests:       28 passed, 28 total
```

### Testes E2E (End-to-End)

Os testes e2e testam a aplicação completa, incluindo banco de dados, autenticação e todas as rotas.

```bash
cd backend/lessons

# Configurar DATABASE_URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lessons_db"

# Executar todos os testes e2e
npm run test:e2e

# Executar apenas testes de lessons
npm run test:e2e -- lesson.e2e-spec.ts

# Executar um teste específico
npm run test:e2e -- lesson.e2e-spec.ts --testNamePattern="should return 201 Created"
```

**Resultado esperado:**
```
PASS test/lesson.e2e-spec.ts
Test Suites: 1 passed, 1 total
Tests:       35 passed, 35 total
```

## 📊 Cobertura de Testes

### Testes Unitários (28 testes)

- ✅ `LessonController` - 6 endpoints testados
- ✅ `SubjectController` - 6 endpoints testados
- ✅ Todos os códigos HTTP de sucesso e erro
- ✅ Validações e tratamento de exceções

### Testes E2E (35 testes)

#### Endpoints de Lessons (6 endpoints × múltiplos cenários)

1. **POST `/api/v1/lessons`** (7 testes)
   - ✅ 201 Created
   - ✅ 400 Bad Request (validação)
   - ✅ 401 Unauthorized
   - ✅ 409 Conflict

2. **GET `/api/v1/lessons`** (4 testes)
   - ✅ 200 OK
   - ✅ 204 No Content
   - ✅ 401 Unauthorized

3. **GET `/api/v1/lessons/:id`** (5 testes)
   - ✅ 200 OK
   - ✅ 400 Bad Request (UUID inválido)
   - ✅ 401 Unauthorized
   - ✅ 404 Not Found

4. **PUT `/api/v1/lessons/:id`** (7 testes)
   - ✅ 200 OK
   - ✅ 400 Bad Request
   - ✅ 401 Unauthorized
   - ✅ 404 Not Found
   - ✅ 409 Conflict

5. **PATCH `/api/v1/lessons/:id`** (7 testes)
   - ✅ 200 OK
   - ✅ 400 Bad Request
   - ✅ 401 Unauthorized
   - ✅ 404 Not Found
   - ✅ 409 Conflict

6. **DELETE `/api/v1/lessons/:id`** (5 testes)
   - ✅ 200 OK
   - ✅ 400 Bad Request (UUID inválido)
   - ✅ 401 Unauthorized
   - ✅ 404 Not Found

## 🔍 Verificando Resultados Detalhados

### Ver saída detalhada dos testes

```bash
# Testes unitários com saída detalhada
npm test -- --verbose

# Testes e2e com saída detalhada
npm run test:e2e -- --verbose
```

### Ver apenas testes que falharam

```bash
# Testes unitários
npm test -- --onlyFailures

# Testes e2e
npm run test:e2e -- --onlyFailures
```

### Executar um teste específico

```bash
# Por nome do teste
npm run test:e2e -- --testNamePattern="should return 201 Created"

# Por arquivo
npm run test:e2e -- lesson.e2e-spec.ts
```

## 🐛 Troubleshooting

### Erro: "Database `lessons_db` does not exist"

```bash
# Criar o banco de dados
docker-compose exec -T postgresql psql -U postgres -c "CREATE DATABASE lessons_db;"
```

### Erro: "The table `public.Subject` does not exist"

```bash
# Executar migrações do Prisma
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lessons_db"
npx prisma db push --skip-generate
```

### Erro: "PrismaClientInitializationError"

Verifique se:
1. PostgreSQL está rodando: `docker-compose ps postgresql`
2. DATABASE_URL está configurada corretamente
3. As credenciais estão corretas (postgres:postgres)

### Erro: "Cannot find module '@nestjs/terminus'"

```bash
# Instalar dependências
npm install --legacy-peer-deps
```

### Testes falhando com 401 Unauthorized

Os testes e2e mockam a autenticação. Se estiver falhando:
1. Verifique se o mock do `fetch` está configurado corretamente
2. Verifique se o token `validToken` está sendo usado nos testes

### Limpar dados de teste

```bash
# Conectar ao banco e limpar tabelas
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lessons_db"
npx prisma db push --skip-generate --force-reset
```

## 📝 Scripts Disponíveis

```json
{
  "test": "jest",                    // Testes unitários
  "test:watch": "jest --watch",      // Testes em modo watch
  "test:cov": "jest --coverage",     // Testes com cobertura
  "test:e2e": "jest --config ./test/jest-e2e.json"  // Testes e2e
}
```

## ✅ Checklist de Verificação

Antes de executar os testes, verifique:

- [ ] PostgreSQL está rodando (`docker-compose ps postgresql`)
- [ ] OAuth está rodando (`docker-compose ps oauth`)
- [ ] Banco `lessons_db` existe
- [ ] Migrações do Prisma foram executadas
- [ ] DATABASE_URL está configurada
- [ ] Dependências estão instaladas (`npm install`)

## 🎯 Execução Rápida (One-liner)

```bash
# Setup completo + testes e2e
cd /home/gabrielteiga/faculdade/25-2/constrsw/base && \
docker-compose up -d postgresql oauth && \
sleep 10 && \
cd backend/lessons && \
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lessons_db" && \
docker-compose exec -T postgresql psql -U postgres -c "CREATE DATABASE lessons_db;" 2>&1 | grep -v "already exists" && \
npx prisma db push --skip-generate && \
npm run test:e2e
```

## 📚 Estrutura dos Testes

```
backend/lessons/
├── src/
│   ├── lesson/
│   │   └── lesson.controller.spec.ts    # Testes unitários de Lessons
│   └── subject/
│       └── subject.controller.spec.ts   # Testes unitários de Subjects
└── test/
    └── lesson.e2e-spec.ts                # Testes e2e completos
```

## 🔗 Referências

- Documentação de endpoints: `endpoints_documentation.md`
- Configuração Jest: `test/jest-e2e.json`
- Schema Prisma: `prisma/schema.prisma`

