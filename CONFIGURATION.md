# 🔧 Configuração do Projeto

Este guia abrangente detalha todas as opções de configuração disponíveis no **Storagie Backend**.

## 📁 Estrutura de Configuração

A configuração está organizada em módulos específicos:

```
src/infrastructure/config/
├── app/           # Configurações da aplicação
├── database/      # Configurações do banco de dados
├── jwt/           # Configurações JWT
├── redis/         # Configurações do Redis
└── throttle/      # Configurações de rate limiting
```

## ⚙️ Configuração por Ambiente

### 🔄 Desenvolvimento (Default)

```env
APP_ENV=development
APP_PORT=3000
DB_TYPE=sqlite
DB_DATABASE=./storage/database.sqlite
CACHE_ENABLED=true
SWAGGER_ENABLED=true
```

### 🚀 Produção

```env
APP_ENV=production
APP_PORT=3000
DB_TYPE=postgres
DB_HOST=your-production-host
DB_DATABASE=storagie

# ⚠️ Obrigatórios em produção
COOKIE_SECRET=your-secure-cookie-secret-minimum-32-chars
JWT_SECRET=your-secure-jwt-secret-minimum-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-secret-minimum-32-chars
```

### 🧪 Teste

```env
APP_ENV=test
DB_TYPE=sqlite
DB_DATABASE=:memory:
CACHE_ENABLED=false
SWAGGER_ENABLED=false
```

## 📋 Variáveis de Ambiente

### 🏗️ Aplicação

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `APP_ENV` | `development` | Ambiente: `development`, `production`, `test`, `staging` |
| `APP_PORT` | `3000` | Porta do servidor |
| `APP_PREFIX` | `api` | Prefixo global das rotas |
| `APP_NAME` | `Storagie Backend` | Nome da aplicação |
| `APP_VERSION` | `1.0.0` | Versão da aplicação |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | URLs permitidas para CORS |

### 🔐 Segurança

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `COOKIE_SECRET` | - | **Obrigatório em produção** - Chave para cookies |
| `JWT_SECRET` | - | **Obrigatório em produção** - Chave para JWT |
| `JWT_EXPIRES_IN` | `15m` | Tempo de expiração do JWT |
| `JWT_REFRESH_SECRET` | - | **Obrigatório em produção** - Chave para refresh token |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Tempo de expiração do refresh token |
| `BCRYPT_ROUNDS` | `12` | Rounds para hash de senhas |

### 🗄️ Banco de Dados

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DB_TYPE` | `sqlite` | Tipo: `sqlite`, `postgres`, `mysql` |
| `DB_HOST` | `localhost` | Host do banco |
| `DB_PORT` | `5432` | Porta do banco |
| `DB_USERNAME` | - | Usuário do banco |
| `DB_PASSWORD` | - | Senha do banco |
| `DB_DATABASE` | `./storage/database.sqlite` | Nome/caminho do banco |
| `DB_SYNCHRONIZE` | `true` | Sincronizar schema automaticamente |
| `DB_LOGGING` | `true` | Habilitar logs de SQL |
| `DB_MIGRATIONS_RUN` | `false` | Executar migrations automaticamente |

### 🚀 Redis (Cache)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `REDIS_HOST` | `localhost` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `REDIS_PASSWORD` | - | Senha do Redis |
| `REDIS_DB` | `0` | Banco do Redis |

### 🛡️ Rate Limiting

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `THROTTLE_TTL` | `60000` | TTL global (ms) |
| `THROTTLE_LIMIT` | `100` | Limite global de requests |
| `API_THROTTLE_TTL` | `60000` | TTL para APIs |
| `API_THROTTLE_LIMIT` | `60` | Limite para APIs |
| `AUTH_THROTTLE_TTL` | `900000` | TTL para autenticação |
| `AUTH_THROTTLE_LIMIT` | `5` | Limite para autenticação |
| `UPLOAD_THROTTLE_TTL` | `60000` | TTL para uploads |
| `UPLOAD_THROTTLE_LIMIT` | `10` | Limite para uploads |
| `HEAVY_THROTTLE_TTL` | `300000` | TTL para operações pesadas |
| `HEAVY_THROTTLE_LIMIT` | `3` | Limite para operações pesadas |

### 🎯 Features

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `CACHE_ENABLED` | `true` | Habilitar sistema de cache |
| `SWAGGER_ENABLED` | `true` (dev) | Habilitar documentação Swagger |
| `HEALTH_CHECKS_ENABLED` | `true` | Habilitar health checks |
| `ASYNC_TASKS_ENABLED` | `true` | Habilitar processamento assíncrono |
| `RATE_LIMIT_ENABLED` | `true` | Habilitar rate limiting |
| `CORS_ENABLED` | `true` | Habilitar CORS |
| `HELMET_ENABLED` | `true` | Habilitar headers de segurança |

### 📊 Monitoramento

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PERFORMANCE_LOGGING` | `true` (dev) | Log de performance |
| `SLOW_QUERY_THRESHOLD` | `1000` | Threshold para queries lentas (ms) |
| `ERROR_TRACKING_ENABLED` | `true` | Rastreamento de erros |
| `METRICS_ENABLED` | `true` | Coleta de métricas |

## 🛠️ Configuração Avançada

### 🔧 Múltiplos Bancos de Dados

```env
# Banco principal
DB_TYPE=postgres
DB_HOST=postgres-primary
DB_DATABASE=storagie

# Banco de leitura (opcional)
DB_READ_HOST=postgres-read-replica
```

### ⚡ Cache Multi-camadas

```env
# Redis para cache distribuído
REDIS_HOST=redis-cluster-host
REDIS_PASSWORD=your-redis-password

# Cache local em memória
MEMORY_CACHE_ENABLED=true
MEMORY_CACHE_TTL=300000
```

### 🔐 Segurança Avançada

```env
# Headers de segurança
HELMET_CSP_ENABLED=true
HELMET_HSTS_ENABLED=true

# Rate limiting por IP
IP_WHITELIST=127.0.0.1,10.0.0.0/8
SUSPICIOUS_IP_BLOCKING=true

# Criptografia adicional
ENCRYPTION_KEY=your-32-char-encryption-key
```

## 🐳 Configuração com Docker

### Docker Compose (Desenvolvimento)

O arquivo `docker-compose.yml` já está configurado com:

- **PostgreSQL 16** com persistência de dados
- **Redis 7** com AOF habilitado
- Health checks automáticos
- Rede isolada para os serviços

```bash
# Iniciar serviços
pnpm docker:up

# Parar serviços
pnpm docker:down

# Ver logs
pnpm docker:logs
```

### Variáveis Docker

```env
# Para usar com docker-compose
DB_HOST=postgres
REDIS_HOST=redis

# Usuário e senha padrão do compose
DB_USERNAME=storagie_user
DB_PASSWORD=storagie_password
```

## ✅ Validação de Configuração

O sistema valida automaticamente todas as configurações na inicialização:

- **Tipos**: Garante que valores numéricos sejam números
- **Obrigatórios**: Falha se variáveis críticas estiverem ausentes
- **Formatos**: Valida URLs, emails, etc.
- **Segurança**: Verifica se secrets são fornecidos em produção

### Exemplo de Validação

```typescript
// O sistema automaticamente valida
APP_PORT=abc // ❌ Erro: deve ser número
JWT_SECRET=   // ❌ Erro: obrigatório em produção
DB_TYPE=mongo // ❌ Erro: tipo não suportado
```

## 🎯 Configuração por Deploy

### Heroku

```env
# Heroku providencia automaticamente
PORT=$PORT
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL

# Configure apenas estas
APP_ENV=production
COOKIE_SECRET=$COOKIE_SECRET
JWT_SECRET=$JWT_SECRET
```

### AWS/GCP

```env
# Use secrets manager
COOKIE_SECRET=arn:aws:secretsmanager:region:account:secret:name
JWT_SECRET=arn:aws:secretsmanager:region:account:secret:name

# Configure load balancer
ALLOWED_ORIGINS=https://yourdomain.com
TRUST_PROXY=true
```

### Railway/Render

```env
# Conexão automática com addons
DB_TYPE=postgres
REDIS_HOST=redis-addon-host

# Configure domínio
ALLOWED_ORIGINS=https://yourapp.railway.app
```

## 🔍 Debugging de Configuração

### Logs de Inicialização

```bash
# A aplicação mostra configurações carregadas
✅ App Config loaded: Storagie Backend on port 3000
✅ Database Config loaded: postgres://localhost:5432/storagie
✅ Redis Config loaded: redis://localhost:6379/0
```

### Health Check de Configuração

```bash
GET /health/config
```

Retorna o estado atual das configurações (sem secrets).

## 📖 Exemplos Práticos

### Setup Rápido de Desenvolvimento

```bash
# 1. Copie o template
cp .env.example .env

# 2. Suba os serviços
pnpm docker:up

# 3. Inicie a aplicação
pnpm dev
```

### Configuração de Produção Mínima

```env
APP_ENV=production
COOKIE_SECRET=generate-a-secure-32-char-string-here
JWT_SECRET=generate-another-secure-32-char-string
JWT_REFRESH_SECRET=and-another-secure-32-char-string

# Configure seu banco
DB_TYPE=postgres
DB_HOST=your-production-db-host
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-db-password
DB_DATABASE=storagie
```

---

## 🆘 Resolução de Problemas

### Erro: "COOKIE_SECRET is required in production"

```bash
# Gere um secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Erro: "Database connection failed"

```bash
# Verifique a conectividade
docker-compose up postgres
# ou
telnet your-db-host 5432
```

### Erro: "Redis connection timeout"

```bash
# Teste a conexão Redis
redis-cli -h your-redis-host ping
```

---

💡 **Dica**: Use `pnpm dev` em desenvolvimento para logs detalhados de configuração!
