import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import clienteRoutes from './routes/clienteRoutes';
import integrationMockRoutes from './routes/integrationMockRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication API with Supabase',
      version: '1.0.0',
      description: 'A comprehensive authentication system with user management, JWT tokens, and Supabase integration',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last profile update timestamp',
            },
          },
          required: ['id', 'email'],
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            name: 'John Doe',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-15T15:30:00Z',
          },
        },
        Cliente: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador único do cliente',
            },
            codigo: {
              type: 'string',
              description: 'Código único do cliente',
            },
            nome: {
              type: 'string',
              description: 'Nome do cliente',
            },
            ativo: {
              type: 'boolean',
              description: 'Status do cliente',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['id', 'codigo', 'nome', 'ativo'],
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            codigo: 'CLI001',
            nome: 'Cliente Exemplo',
            ativo: true,
            created_at: '2026-02-17T10:00:00.000Z',
            updated_at: '2026-02-17T10:00:00.000Z',
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Operation success status',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT access token',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of error messages',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api', integrationMockRoutes);
app.use('/app-root/api', integrationMockRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
  },
  customCss: '.topbar { display: none }',
  customSiteTitle: 'Authentication API Docs',
}));

// Health check root
app.get('/', (req: Request, res: Response) => {
  const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol;
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host');
  const docsUrl = host ? `${protocol}://${host}/api-docs` : `/api-docs`;

  res.json({
    success: true,
    message: 'Authentication API is running',
    docs: docsUrl,
    version: '1.0.0',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Erro interno do servidor',
    detailedMessage: err.stack || 'Ocorreu um erro inesperado no servidor.'
  });
});

// Start server only when running directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   Authentication API with Supabase            ║
╚═══════════════════════════════════════════════╝

✅ Server is running on port ${PORT}
📚 API Documentation: http://localhost:${PORT}/api-docs
🏥 Health Check: http://localhost:${PORT}/

Environment: ${process.env.NODE_ENV || 'development'}
  `);
  });
}

export default app;
