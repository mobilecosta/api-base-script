# Authentication API with Supabase

Um sistema completo de autenticação de usuários em TypeScript com Express.js, integrado ao Supabase, incluindo documentação Swagger.

## 🚀 Recurentes Principais

- ✅ Autenticação com cadastro e login
- ✅ JWT (JSON Web Tokens) para autorização
- ✅ Hash de senhas com bcrypt
- ✅ Perfil de usuário (atualizar dados)
- ✅ Alterar senha
- ✅ Integração Supabase PostgreSQL
- ✅ Documentação Swagger/OpenAPI
- ✅ CORS habilitado
- ✅ Middleware de autenticação
- ✅ Validação de dados

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Conta Supabase (criar em https://supabase.com)

## 🔧 Configuração Inicial

### 1. Clonar/Preparar o Projeto

```bash
cd api_base_script
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Supabase

1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Copie suas credenciais (URL e Keys)
4. Crie o arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais Supabase:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=sua-chave-super-secreta-jwt
JWT_EXPIRES_IN=7d
```

### 5. Criar Tabela no Supabase

Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice para email
CREATE INDEX idx_users_email ON users(email);

-- Habilitar Row Level Security (opcional mas recomendado)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários lerem seus próprios dados
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);
```

## ▶️ Executar o Projeto

### Desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## 📚 Documentação da API

Acesse a documentação Swagger em:
```
http://localhost:3000/api-docs
```

### Endpoints Disponíveis

#### 🔐 Autenticação

- **POST** `/api/auth/register` - Registrar novo usuário
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }
  ```

- **POST** `/api/auth/login` - Fazer login
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```

#### 👤 Perfil do Usuário

- **GET** `/api/auth/profile` - Obter perfil do usuário autenticado
  - Requer: `Authorization: Bearer <token>`

- **PUT** `/api/auth/profile` - Atualizar perfil do usuário
  - Requer: `Authorization: Bearer <token>`
  ```json
  {
    "name": "New Name"
  }
  ```

- **POST** `/api/auth/change-password` - Alterar senha
  - Requer: `Authorization: Bearer <token>`
  ```json
  {
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword456"
  }
  ```

#### 🏥 Saúde da API

- **GET** `/api/auth/health` - Verificar status da API

## 🔑 Autenticação com JWT

Após fazer login ou registrar, você receberá um token JWT:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-15T15:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usar o Token

Inclua o token em todas as requisições autenticadas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Estrutura do Projeto

```
api_base_script/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Configuração Supabase
│   ├── controllers/
│   │   └── authController.ts    # Lógica de autenticação
│   ├── middleware/
│   │   └── authMiddleware.ts    # Middleware JWT
│   ├── routes/
│   │   └── authRoutes.ts        # Definição de rotas
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── utils/
│   │   └── validation.ts        # Funções de validação
│   └── index.ts                 # Arquivo principal
├── dist/                        # Código compilado (gerado)
├── .env.example                 # Exemplo de variáveis
├── .gitignore                   # Arquivos ignorados
├── package.json                 # Dependências
├── tsconfig.json                # Configuração TypeScript
└── README.md                    # Este arquivo
```

## 🛡️ Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Tokens JWT com expiração
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Variáveis sensíveis em .env

## 🧪 Testando a API

### Usando cURL

```bash
# Health Check
curl http://localhost:3000/api/auth/health

# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# Obter perfil (substitua TOKEN pelo token JWT recebido)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/auth/profile
```

### Usando Swagger UI

1. Acesse http://localhost:3000/api-docs
2. Clique em "Authorize" (cadeado no canto superior direito)
3. Coloque seu token JWT
4. Use a interface para testar os endpoints

### Usando Postman

1. Importe a coleção Swagger: `http://localhost:3000/api-docs`
2. Configure a variável `token` com seu JWT
3. Use a coleção para fazer requisições

## 🐛 Troubleshooting

### Erro: "Missing Supabase configuration"
- Verifique se `.env` existe e tem `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- Verifique se as credenciais estão corretas

### Erro: "User already exists"
- O email já foi registrado
- Use outro email ou delete o usuário do Supabase

### Erro: "Invalid token"
- Token expirou
- Faça login novamente para obter um novo token
- Verifique formato: `Authorization: Bearer <token>`

### Erro de conexão Supabase
- Verifique sua conexão de internet
- Confirme que o `SUPABASE_URL` está correto
- Verifique se o projeto Supabase está ativo

## 📦 Dependências Principais

- **express**: Framework web
- **@supabase/supabase-js**: Cliente Supabase
- **jsonwebtoken**: Geração e verificação JWT
- **bcryptjs**: Hash de senhas
- **swagger-ui-express**: UI Swagger
- **swagger-jsdoc**: Gerador de especificação Swagger
- **cors**: Middleware CORS
- **dotenv**: Carregamento de variáveis de ambiente

## 🚀 Deployment

### Usar em Produção

1. Altere `NODE_ENV=production` no `.env`
2. Compile o projeto: `npm run build`
3. Inicie o servidor: `npm start`
4. Configure variáveis de ambiente de produção
5. Use um gerenciador de processos (PM2, systemd, etc.)

### Exemplo com PM2

```bash
npm install -g pm2

# Iniciar
pm2 start dist/index.js --name "auth-api"

# Monitorar
pm2 monit

# Logs
pm2 logs auth-api
```

## 📄 Licença

MIT

## 👨‍💻 Suporte

Para questões ou problemas, consulte a documentação do Supabase:
https://supabase.com/docs

## ✨ Próximos Passos

- [ ] Adicionar autenticação OAuth (Google, GitHub)
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Adicionar resetar senha via email
- [ ] Implementar refresh tokens
- [ ] Adicionar rate limiting
- [ ] Implementar logs detalhados
- [ ] Adicionar testes unitários
- [ ] Implementar cache com Redis
