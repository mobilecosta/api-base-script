export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
  };
  token?: string;
  refreshToken?: string;
  errors?: string[];
}

export interface TokenPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Express.Request {
  user?: TokenPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export interface POMessage {
  code: string;
  message: string;
  detailedMessage?: string;
  type?: 'error' | 'warning' | 'information';
  helpUrl?: string;
}

export interface POCollectionResponse<T> {
  hasNext: boolean;
  total?: number;
  items: T[];
  _messages?: POMessage[];
}

export interface POErrorResponse {
  code: string;
  message: string;
  detailedMessage: string;
  helpUrl?: string;
  type?: 'error' | 'warning' | 'information';
  details?: POMessage[];
}
