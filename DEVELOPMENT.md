# Guia de Desenvolvimento e Deployment

## 🔧 Desenvolvimento Local

### Instalação de Dependências

```bash
npm install
```

### Executar em Modo Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`

### Compilar TypeScript

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`

### Verificar Tipos (Type Checking)

```bash
npm run type-check
```

## 🐳 Docker

### Build da Imagem Docker

```bash
docker build -t auth-api:latest .
```

### Rodar com Docker Compose

```bash
# Iniciar
docker-compose up

# Rodar em background
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f auth-api
```

### Usar Imagem Docker Manualmente

```bash
docker run -p 3000:3000 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e JWT_SECRET=your-secret \
  auth-api:latest
```

## 📦 Variáveis de Ambiente

Criar arquivo `.env` com:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=sua-chave-muito-secreta
JWT_EXPIRES_IN=7d
```

## 🚀 Deployment

### Heroku

```bash
# Login
heroku login

# Criar app
heroku create seu-app-name

# Configure variáveis de ambiente
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_ANON_KEY=...
heroku config:set SUPABASE_SERVICE_ROLE_KEY=...
heroku config:set JWT_SECRET=...
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### AWS Lambda + API Gateway

```bash
# Instalar Serverless Framework
npm install -g serverless

# Configure credenciais AWS
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET

# Deploy (com serverless.yml configurado)
serverless deploy
```

### DigitalOcean App Platform

1. Conecte seu repositório GitHub
2. Crie novo App
3. Configure variáveis de ambiente
4. Deploy automático

### Google Cloud Run

```bash
# Authenticate
gcloud auth login

# Build
gcloud builds submit --tag gcr.io/seu-projeto/auth-api

# Deploy
gcloud run deploy auth-api \
  --image gcr.io/seu-projeto/auth-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars SUPABASE_URL=...,JWT_SECRET=...
```

### Azure App Service

```bash
# Authenticate
az login

# Create resource group
az group create --name myResourceGroup --location eastus

# Create App Service plan
az appservice plan create --name myAppPlan --resource-group myResourceGroup --sku B1 --is-linux

# Create web app
az webapp create --resource-group myResourceGroup --plan myAppPlan --name myapp --runtime "node|18-lts"

# Deploy
az webapp up --resource-group myResourceGroup --name myapp
```

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] Alterar `JWT_SECRET` para uma string aleatória forte
- [ ] Habilitar HTTPS
- [ ] Configurar CORS corretamente
- [ ] Usar variáveis de ambiente seguras
- [ ] Implementar rate limiting
- [ ] Adicionar validação CSRF (se necessário)
- [ ] Implementar logging e monitoramento
- [ ] Usar HTTPS para conexão com Supabase
- [ ] Revisar permissões RLS no Supabase
- [ ] Implementar 2FA (two-factor authentication)

### Nginx Configuration (Reverse Proxy)

```nginx
upstream auth_api {
  server 127.0.0.1:3000;
}

server {
  listen 80;
  server_name api.example.com;
  
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.example.com;

  ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Proxy
  location / {
    proxy_pass http://auth_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### PM2 Configuration (systemd)

```bash
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name "auth-api" --instances max

# Generate startup script
pm2 startup

# Save current configuration
pm2 save

# View logs
pm2 logs auth-api

# Monitor
pm2 monit
```

## 📊 Monitoramento

### Health Check Endpoint

```bash
curl http://localhost:3000/api/auth/health
```

### Logs

```bash
# Development
npm run dev  # Logs appear on console

# Production (PM2)
pm2 logs auth-api

# Docker
docker-compose logs -f auth-api

# Docker individual
docker logs container-id
```

### Métricas Recomendadas para Monitorar

- Tempo de resposta dos endpoints
- Taxa de erro (5xx responses)
- Autenticações bem-sucedidas vs falhas
- Uso de memória
- CPU usage
- Conexões de banco de dados

## 🧪 Testes

### Estrutura para Testes (TODO)

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev supertest @types/supertest
```

### Comando para Testar (quando implementado)

```bash
npm test
```

## 📝 CI/CD

### GitHub Actions

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run type-check
      # Deploy steps...
```

## 📞 Suporte

Para problemas com:
- **Supabase**: https://supabase.com/docs
- **Express**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/
- **JWT**: https://jwt.io/

## 🔄 Atualizações

```bash
# Ver pacotes desatualizados
npm outdated

# Atualizar todos
npm update

# Atualizar específico
npm install package@latest
```

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Memória insuficiente

Aumentar limite de memória Node:

```bash
NODE_OPTIONS=--max-old-space-size=2048 npm start
```

### Timeout de conexão Supabase

1. Verificar internet
2. Validar credenciais
3. Aumentar timeout em `src/config/supabase.ts`
4. Verificar status do Supabase em https://status.supabase.com
