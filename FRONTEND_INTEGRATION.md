# Guia de Integração Frontend

Este guia ajuda você a integrar a Authentication API em seu frontend.

## 🚀 Configuração Básica

### 1. Configurar URL Base Corretamente

```typescript
// config/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    HEALTH: `${API_BASE_URL}/api/auth/health`,
  },
};
```

### 2. Criar Serviço de Autenticação

#### React/JavaScript

```typescript
// services/authService.ts
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  async register(email: string, password: string, name?: string) {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  async getProfile() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  async updateProfile(name: string) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    return response.json();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  getToken() {
    return localStorage.getItem('authToken');
  },
};
```

## 📱 Exemplos de Componentes

### Portal de Login

```typescript
// components/LoginForm.tsx
import { useState } from 'react';
import { authService } from '../services/authService';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        window.location.href = '/dashboard';
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### Protected Route

```typescript
// components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = authService.getToken();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

## 🔑 Gerenciamento de Token

### Stored in LocalStorage

```typescript
// No login:
localStorage.setItem('authToken', token);

// Acessar:
const token = localStorage.getItem('authToken');

// Logout:
localStorage.removeItem('authToken');
```

### Com Axios (Recomendado)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 🎯 Casos de Uso Comuns

### Registrar Novo Usuário

```typescript
const result = await authService.register(
  'user@example.com',
  'SecurePassword123',
  'User Name'
);

if (result.success) {
  console.log('User registered:', result.user);
  console.log('Token:', result.token);
  // Redirecionar para login ou dashboard
}
```

### Verificar se Usuário está Autenticado

```typescript
function isAuthenticated(): boolean {
  return !!authService.getToken();
}
```

### Obter Dados do Usuário Atual

```typescript
const result = await authService.getProfile();
if (result.success) {
  console.log('User profile:', result.user);
  // Atualizar estado/contexto
}
```

### Alterar Senha

```typescript
const result = await authService.changePassword(
  'OldPassword123',
  'NewPassword456'
);

if (result.success) {
  console.log('Password changed successfully');
  // Mostrar mensagem de sucesso
}
```

## 🔐 Contexto de Autenticação (React)

```typescript
// contexts/AuthContext.tsx
import { createContext, useState, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
    } else {
      throw new Error(result.message);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const result = await authService.register(email, password, name);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('authToken', result.token);
    } else {
      throw new Error(result.message);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## 📱 Uso no Componente

```typescript
// App.tsx
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <LoginForm />;
}
```

## 🌐 CORS Configuration

Se o frontend está em domínio diferente:

### Backend (.env)

```env
# Adicione origem frontend permitida
ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com
```

### Backend (index.ts)

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
```

## ⚠️ Tratamento de Erros

```typescript
interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

async function handleApiError(error: unknown) {
  if (error instanceof Response) {
    const data: ApiError = await error.json();
    return data.message;
  }
  return 'An error occurred';
}
```

## 🔄 Refresh Token (Quando Implementado)

```typescript
// Aguarde a implementação de refresh tokens na API
async function loginWithRefresh(email: string, password: string) {
  const result = await authService.login(email, password);
  
  localStorage.setItem('accessToken', result.token);
  localStorage.setItem('refreshToken', result.refreshToken);
  
  // Implementar lógica para renovar token expirado
}
```

## 📊 Exemplos com Diferentes Frameworks

### Vue.js

```typescript
// composables/useAuth.ts
import { ref } from 'vue';
import { authService } from '../services/authService';

export function useAuth() {
  const user = ref(null);
  const isAuthenticated = ref(false);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      user.value = result.user;
      isAuthenticated.value = true;
    }
  };

  return { user, isAuthenticated, login };
}
```

### Angular

```typescript
// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject(null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post('/api/auth/login', { email, password });
  }

  getProfile() {
    return this.http.get('/api/auth/profile');
  }
}
```

## 📞 Troubleshooting

### CORS Error

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solução:**
1. Verificar `ALLOWED_ORIGINS` no backend
2. Usar credentials: true** nas requisições se necessário
3. Testar com `curl` para confirmar resposta CORS

### 401 Unauthorized

Token expirado ou inválido.

```typescript
// Interceptor para renovar token
if (error.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

### 422 Validation Error

Dados inválidos. Verificar `response.errors`.

```typescript
if (!result.success && result.errors) {
  result.errors.forEach(error => console.error(error));
}
```

## 🎓 Recursos Adicionais

- Documentação API: `http://localhost:3000/api-docs`
- JWT.io: https://jwt.io
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Axios: https://axios-http.com

## ✨ Boas Práticas

1. ✅ Sempre armazene tokens em local seguro (não em variáveis globais)
2. ✅ Implemente loading states e error handling
3. ✅ Use HTTPS em produção
4. ✅ Adicione validação de entrada no frontend
5. ✅ Implemente logout automático ao expirar token
6. ✅ Teste com tokens expirados
7. ✅ Não exponha dados sensíveis nos logs
8. ✅ Implemente rate limiting no frontend
9. ✅ Use CSRF protection se necessário
10. ✅ Mantenha dependências atualizadas
