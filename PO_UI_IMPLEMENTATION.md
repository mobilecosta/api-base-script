# Implementação de API CRUD (Padrão PO UI)

Esta implementação adiciona funcionalidades de CRUD para a tabela `users` seguindo as diretrizes de API do [PO UI](https://po-ui.io/guides/api).

## Alterações Realizadas

### 1. Novos Tipos e Interfaces
Foram adicionadas interfaces no arquivo `src/types/index.ts` para padronizar as respostas de coleções e erros:
- `POMessage`: Estrutura para mensagens informativas ou de erro.
- `POCollectionResponse<T>`: Formato para listagem com suporte a paginação (`hasNext` e `items`).
- `POErrorResponse`: Formato padrão para erros (códigos 4xx e 5xx).

### 2. Novo Controller de Usuários
Criado em `src/controllers/userController.ts`, implementando:
- **Listagem (`listUsers`)**: Suporta paginação (`page`, `pageSize`), ordenação (`order`) e filtros dinâmicos.
- **Busca por ID (`getUser`)**: Retorna o objeto do usuário ou erro 404 formatado.
- **Criação (`createUser`)**: Cria novo usuário com senha criptografada.
- **Atualização (`updateUser`)**: Atualiza dados do usuário.
- **Exclusão (`deleteUser`)**: Remove o usuário do banco de dados.

### 3. Rotas e Documentação
- Novas rotas registradas em `src/routes/userRoutes.ts`.
- Integração com Swagger para documentação automática em `/api-docs`.
- Rotas protegidas por autenticação JWT.

### 4. Padronização de Erros Global
- O middleware de autenticação (`src/middleware/authMiddleware.ts`) agora retorna erros no formato PO UI.
- O handler de erro global no `src/index.ts` foi atualizado para garantir que qualquer falha inesperada siga o padrão.

## Como Testar

1. Certifique-se de que as dependências estão instaladas: `npm install`.
2. Configure seu arquivo `.env` com as credenciais do Supabase.
3. Execute os testes: `npm test src/tests/userCRUD.test.ts`.
4. Inicie o servidor: `npm run dev`.
5. Acesse a documentação Swagger: `http://localhost:3000/api-docs`.

## Exemplo de Resposta de Coleção (GET /api/users)
```json
{
  "hasNext": true,
  "items": [
    { "id": "...", "email": "user@example.com", "name": "John Doe" }
  ]
}
```

## Exemplo de Resposta de Erro (404 Not Found)
```json
{
  "code": "USER_NOT_FOUND",
  "message": "Usuário não encontrado",
  "detailedMessage": "Nenhum usuário encontrado com o ID: 123"
}
```
