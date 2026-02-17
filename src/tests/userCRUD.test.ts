import request from 'supertest';
import app from '../index';
import { supabaseAdmin } from '../config/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

describe('User CRUD API (PO UI Standard)', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Mock user for authentication
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com'
    };
    authToken = jwt.sign(testUser, JWT_SECRET);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should list users with PO UI format', async () => {
    // Mock Supabase response
    const mockUsers = [{ id: '1', email: 'u1@ex.com' }, { id: '2', email: 'u2@ex.com' }];
    const spy = jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: mockUsers, count: 2, error: null }),
      ilike: jest.fn().mockReturnThis(),
    } as any);

    const res = await request(app)
      .get('/api/users?page=1&pageSize=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('hasNext', false);
    expect(res.body.items).toHaveLength(2);
    
    spy.mockRestore();
  });

  it('should get a single user', async () => {
    const mockUser = { id: '123', email: 'u1@ex.com', name: 'User 1' };
    const spy = jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
    } as any);

    const res = await request(app)
      .get('/api/users/123')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('123');
    
    spy.mockRestore();
  });

  it('should return 404 in PO UI format for non-existent user', async () => {
    const spy = jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    } as any);

    const res = await request(app)
      .get('/api/users/999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('code', 'USER_NOT_FOUND');
    expect(res.body).toHaveProperty('detailedMessage');
    
    spy.mockRestore();
  });
});
