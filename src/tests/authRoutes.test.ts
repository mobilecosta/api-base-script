import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../index';
import { supabaseAdmin } from '../config/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

const createToken = (id = 'user-1', email = 'user@example.com') =>
  jwt.sign({ id, email }, JWT_SECRET);

describe('Auth Routes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return api health', async () => {
    const res = await request(app).get('/api/auth/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('API is running');
  });

  it('should validate register payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalid-email',
      password: '123'
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });

  it('should return conflict when user already exists on register', async () => {
    jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: 'existing-user' },
        error: null
      })
    } as any);

    const res = await request(app).post('/api/auth/register').send({
      email: 'existing@example.com',
      password: 'Password123',
      name: 'Existing User'
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User already exists');
  });

  it('should login successfully', async () => {
    const hashedPassword = await bcrypt.hash('Password123', 10);
    jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          email: 'user@example.com',
          password: hashedPassword,
          name: 'User Name',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-02T00:00:00.000Z'
        },
        error: null
      })
    } as any);

    const res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'Password123'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('user@example.com');
  });

  it('should deny profile without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('should return profile for authenticated user', async () => {
    jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User Name',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-02T00:00:00.000Z'
        },
        error: null
      })
    } as any);

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${createToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.id).toBe('user-1');
  });

  it('should update profile', async () => {
    jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'New Name',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-03T00:00:00.000Z'
        },
        error: null
      })
    } as any);

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${createToken()}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('New Name');
  });

  it('should change password for authenticated user', async () => {
    const currentHash = await bcrypt.hash('OldPassword123', 10);

    const fromSpy = jest.spyOn(supabaseAdmin, 'from');
    fromSpy
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { password: currentHash },
          error: null
        })
      } as any)
      .mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      } as any);

    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${createToken()}`)
      .send({
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Password changed successfully');
  });
});
