# 🚀 Quick Start Guide

## Começar em 5 Minutos

### 1️⃣ Setup Supabase

1. Vá para https://supabase.com e crie uma conta gratuita
2. Crie um novo projeto
3. Copie suas credenciais (URL e Keys)

### 2️⃣ Clonar e Instalar

```bash
cd api_base_script
npm install
```

### 3️⃣ Configurar .env

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env com suas credenciais Supabase
# SUPABASE_URL=https://seu-projeto.supabase.co
# SUPABASE_ANON_KEY=sua-chave-anonima
# SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 4️⃣ Criar Tabela no Supabase

No Supabase Dashboard, vá para SQL Editor e execute:

```sql
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### 5️⃣ Rodar o Servidor

```bash
npm run dev
```

Você verá:
```
✅ Server is running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
```

## 🧪 Testar Imediatamente

### No navegador:

1. Acesse documentação Swagger:
```
http://localhost:3000/api-docs
```

2. Registre um usuário em POST `/api/auth/register`
3. Copie o token retornado
4. Clique em "Authorize" (cadeado no canto superior)
5. Cole o token e use os endpoints

### Via cURL:

```bash
# Registrar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"Senha123","name":"Test User"}'

# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"Senha123"}' \
  | jq -r '.token')

# Obter perfil
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/profile
```

## 📚 Endpoints Principais

| Método | Endpoint | Descrição | Autenticado? |
|--------|----------|-----------|------------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Fazer login | ❌ |
| GET | `/api/auth/profile` | Obter perfil | ✅ |
| PUT | `/api/auth/profile` | Atualizar perfil | ✅ |
| POST | `/api/auth/change-password` | Alterar senha | ✅ |
| GET | `/api/auth/health` | Verificar saúde da API | ❌ |

## 🐳 Usar Docker (Opcional)

```bash
# Build e rodar com Docker Compose
docker-compose up

# A API estará em http://localhost:3000
# Swagger em http://localhost:3000/api-docs
```

## 🔍 Debug

### Ver logs:
```bash
npm run dev    # Mostra logs detalhados
```

### Verificar erros comuns:

- **"SUPABASE_URL is missing"**: Edite `.env` com suas credenciais
- **"User already exists"**: Use outro email
- **"Invalid token"**: Token expirou, faça login novamente

## 📚 Próximas Etapas

- [ ] Ler a documentação completa em [README.md](README.md)
- [ ] Implementar em seu frontend
- [ ] Deploy em produção
- [ ] Adicionar OAuth (Google/GitHub)

## 💡 Dicas

✅ Use o Swagger UI para testar todos os endpoints interativamente
✅ Salve o token JWT para usar em requisições subsequentes
✅ Altere `JWT_SECRET` em produção
✅ Configure CORS conforme necessário

Divirta-se! 🎉
