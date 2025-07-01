# 🚀 Storagie Backend

Uma API REST robusta e escalável construída com **NestJS**, **TypeScript** e **Clean Architecture**, implementando padrões **Domain Driven Design (DDD)** para máxima flexibilidade e manutenibilidade.

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [🛠️ Tecnologias](#️-tecnologias)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Início Rápido](#-início-rápido)
- [📦 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [🏃‍♂️ Executando](#️-executando)
- [🔍 Scripts Disponíveis](#-scripts-disponíveis)
- [📊 Monitoramento](#-monitoramento)
- [🧪 Testes](#-testes)
- [📚 Documentação da API](#-documentação-da-api)
- [🐳 Docker](#-docker)
- [🚀 Deploy](#-deploy)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)

## 🎯 Sobre o Projeto

O **Storagie Backend** é uma solução completa de backend que oferece:

- 🏗️ **Arquitetura Limpa** com separação clara de responsabilidades
- 🚀 **Performance otimizada** com cache Redis e processamento assíncrono
- 🛡️ **Segurança robusta** com JWT, rate limiting e validação
- 📊 **Monitoramento avançado** com métricas em tempo real
- 🔄 **Sistema de tasks** para processamento assíncrono
- 🗄️ **Suporte multi-banco** (PostgreSQL, MySQL, SQLite)
- 📈 **Escalabilidade horizontal** preparada para microserviços

## 🛠️ Tecnologias

### Core Framework

- **[NestJS](https://nestjs.com/)** v11 - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** v5.7 - Superset tipado do JavaScript
- **[Fastify](https://www.fastify.io/)** v5 - Framework web de alta performance

### Banco de Dados & ORM

- **[TypeORM](https://typeorm.io/)** v0.3 - ORM moderno e flexível
- **[PostgreSQL](https://www.postgresql.org/)** - Banco principal para produção
- **[SQLite](https://www.sqlite.org/)** - Banco para desenvolvimento
- **[MySQL/MariaDB](https://mariadb.org/)** - Suporte opcional

### Cache & Performance

- **[Redis](https://redis.io/)** - Cache em memória e sessões
- **[IORedis](https://github.com/luin/ioredis)** - Cliente Redis otimizado

### Segurança & Validação

- **[class-validator](https://github.com/typestack/class-validator)** - Validação declarativa
- **[class-transformer](https://github.com/typestack/class-transformer)** - Transformação de objetos
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de senhas
- **[Passport](http://www.passportjs.org/)** - Autenticação flexível
- **[@nestjs/throttler](https://github.com/nestjs/throttler)** - Rate limiting

### Monitoramento & Logs

- **[@nestjs/terminus](https://github.com/nestjs/terminus)** - Health checks
- **[Pino](https://getpino.io/)** - Logger de alta performance

### DevOps & Qualidade

- **[Docker](https://www.docker.com/)** - Containerização
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[Jest](https://jestjs.io/)** - Framework de testes
- **[SWC](https://swc.rs/)** - Compilador rápido para TypeScript

## 🏗️ Arquitetura

Este projeto implementa **Clean Architecture** com **Domain Driven Design**:

```
src/
├── domain/           # 🏛️ Regras de negócio puras
├── application/      # 🎯 Casos de uso e orquestração
├── infrastructure/   # 🔧 Detalhes técnicos
├── presentation/     # 🌐 Interface com mundo externo
└── shared/          # 🔄 Recursos compartilhados
```

**Benefícios:**

- ✅ **Testabilidade** - Fácil criação de mocks e testes unitários
- ✅ **Manutenibilidade** - Código organizado e desacoplado
- ✅ **Flexibilidade** - Fácil troca de tecnologias
- ✅ **Escalabilidade** - Estrutura preparada para crescimento

> 📖 **Documentação detalhada:** [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0 (recomendado) ou npm/yarn
- **Redis** ≥ 6.0 (opcional, para cache)
- **PostgreSQL** ≥ 13 (para produção)

### ⚡ Quick Start

```bash
# 1️⃣ Clone o repositório
git clone <repository-url>
cd storagie/source/backend

# 2️⃣ Instale as dependências
pnpm install

# 3️⃣ Configure o ambiente
cp .env.example .env
# Edite o .env conforme necessário

# 4️⃣ Inicie os serviços (opcional)
pnpm docker:up

# 5️⃣ Execute em modo desenvolvimento
pnpm dev

# 6️⃣ Acesse a aplicação
# API: http://localhost:3000
# Health: http://localhost:3000/health
# Docs: http://localhost:3000/docs (se habilitado)
```

## 📦 Instalação

### Usando pnpm (Recomendado)

```bash
pnpm install
```

### Usando npm

```bash
npm install
```

### Usando yarn

```bash
yarn install
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie e configure o arquivo de ambiente:

```bash
cp .env.example .env
```

### 2. Configurações Essenciais

**Para Desenvolvimento:**

```env
APP_ENV=development
APP_PORT=3000
DB_TYPE=sqlite
DB_DATABASE=./storage/database.sqlite
CACHE_ENABLED=true
```

**Para Produção:**

```env
APP_ENV=production
APP_PORT=3000
DB_TYPE=postgres
DB_HOST=your-db-host
DB_DATABASE=storagie
# Configure secrets obrigatórios!
COOKIE_SECRET=your-secure-cookie-secret
JWT_SECRET=your-secure-jwt-secret
```

> 📖 **Configuração completa:** [CONFIGURATION.md](./CONFIGURATION.md)

### 3. Banco de Dados

**SQLite (Desenvolvimento):**

```bash
# Já configurado no .env.example
# Banco é criado automaticamente
```

**PostgreSQL (Produção):**

```bash
# Configure as variáveis no .env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=storagie_user
DB_PASSWORD=your-password
DB_DATABASE=storagie
```

## 🏃‍♂️ Executando

### Desenvolvimento

```bash
# Desenvolvimento com hot-reload
pnpm dev

# Debugging
pnpm debug
```

### Produção

```bash
# Build
pnpm build

# Produção
pnpm prod
```

### Com Docker

```bash
# Subir serviços (Redis + PostgreSQL)
pnpm docker:up

# Parar serviços
pnpm docker:down

# Desenvolvimento completo
pnpm dev:setup
```

## 🔍 Scripts Disponíveis

### Desenvolvimento

- `pnpm dev` - Modo desenvolvimento com hot-reload
- `pnpm debug` - Modo debug
- `pnpm build` - Build para produção
- `pnpm prod` - Execução em produção

### Banco de Dados

- `pnpm db:migration:generate <name>` - Gerar nova migration
- `pnpm db:migration:run` - Executar migrations
- `pnpm db:migration:revert` - Reverter última migration
- `pnpm db:schema:sync` - Sincronizar schema (⚠️ cuidado!)

### Qualidade de Código

- `pnpm lint` - Verificar linting
- `pnpm format` - Formatar código
- `pnpm test` - Executar testes
- `pnpm test:watch` - Testes em modo watch
- `pnpm test:cov` - Testes com cobertura

### Docker

- `pnpm docker:up` - Subir serviços
- `pnpm docker:down` - Parar serviços
- `pnpm docker:logs` - Ver logs dos serviços

## 📊 Monitoramento

### Health Checks

```bash
# Health geral
GET /health

# Liveness probe
GET /health/live

# Readiness probe
GET /health/ready

# Métricas completas
GET /health/metrics

# Cache status
GET /health/cache

# Performance stats
GET /health/performance
```

### Métricas Disponíveis

- **Cache**: Hit rate, estatísticas Redis
- **Performance**: Tempo de resposta, queries lentas
- **Sistema**: CPU, memória, uptime
- **Tasks**: Queue status, workers ativos

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Testes unitários
pnpm test:unit

# Testes e2e
pnpm test:e2e

# Cobertura
pnpm test:cov

# Watch mode
pnpm test:watch
```

### Estrutura de Testes

```
test/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
└── e2e/           # Testes end-to-end
```

## 📚 Documentação da API

### Swagger/OpenAPI

Acesse a documentação interativa:

```
http://localhost:3000/docs
```

### Postman Collection

Importe a collection disponível em `/docs/postman/`

### Exemplos de Uso

#### Criar Usuário

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

#### Buscar Usuário

```bash
curl http://localhost:3000/api/v1/users/{id}
```

## 🐳 Docker

### Docker Compose (Desenvolvimento)

```yaml
# docker-compose.yml incluído
services:
  - postgres
  - redis
  - adminer (opcional)
```

```bash
# Subir todos os serviços
docker-compose up -d

# Apenas banco e cache
docker-compose up -d postgres redis
```

### Dockerfile (Produção)

```bash
# Build da imagem
docker build -t storagie-backend .

# Executar container
docker run -p 3000:3000 storagie-backend
```

## 🚀 Deploy

### Variáveis Obrigatórias em Produção

```env
APP_ENV=production
COOKIE_SECRET=your-secure-secret
JWT_SECRET=your-secure-secret
JWT_REFRESH_SECRET=your-secure-secret
DB_HOST=your-production-db
DB_PASSWORD=your-secure-password
REDIS_HOST=your-redis-host
```

### Plataformas Suportadas

- **Heroku** - Deploy direto
- **AWS ECS/Fargate** - Containerizado
- **Google Cloud Run** - Serverless
- **Railway** - Deploy simplificado
- **DigitalOcean App Platform** - PaaS

### Checklist de Deploy

- [ ] Configurar variáveis de ambiente
- [ ] Executar migrations do banco
- [ ] Configurar Redis/cache
- [ ] Configurar monitoramento
- [ ] Testar health checks
- [ ] Configurar logging
- [ ] Configurar backup do banco

## 🤝 Contribuindo

### Workflow

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch (`git checkout -b feature/nova-feature`)
4. **Faça** suas alterações
5. **Teste** tudo (`pnpm test`)
6. **Commit** (`git commit -m 'feat: nova feature'`)
7. **Push** (`git push origin feature/nova-feature`)
8. **Abra** um Pull Request

### Padrões

- **Commits**: Use [Conventional Commits](https://conventionalcommits.org/)
- **Code Style**: ESLint + Prettier configurados
- **Testes**: Mantenha cobertura > 80%
- **Documentação**: Atualize docs relevantes

### Estrutura de Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação de código
refactor: refatoração
test: adição de testes
chore: tarefas de manutenção
```

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🆘 Suporte

- **Documentação**: [ARCHITECTURE.md](./ARCHITECTURE.md) | [CONFIGURATION.md](./CONFIGURATION.md)
- **Issues**: Reporte bugs ou sugira melhorias
- **Discussions**: Participe das discussões da comunidade

---

<div align="center">
  <strong>Feito com ❤️ usando NestJS, TypeScript e Clean Architecture</strong>
</div>
