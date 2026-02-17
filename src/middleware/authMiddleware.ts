import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Token de acesso não fornecido',
      detailedMessage: 'É necessário um token Bearer JWT no cabeçalho Authorization para acessar este recurso.'
    });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado',
        detailedMessage: 'O token fornecido expirou. Por favor, realize o login novamente.'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
        detailedMessage: 'O token fornecido não é válido ou está malformado.'
      });
    } else {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Acesso proibido',
        detailedMessage: 'Você não tem permissão para acessar este recurso.'
      });
    }
  }
};

export const optionalAuthToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';
      const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
      req.user = decoded;
    } catch (error) {
      // Token invalid or expired, continue without user
    }
  }

  next();
};
