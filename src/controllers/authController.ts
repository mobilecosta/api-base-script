import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseClient, supabaseAdmin } from '../config/supabase';
import { validateAuthRequest } from '../utils/validation';
import { AuthResponse, TokenPayload } from '../types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-default-secret';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    console.log('📝 Registro iniciado para:', email);

    // Validate input
    const validation = validateAuthRequest(email, password);
    if (!validation.isValid) {
      console.warn('❌ Validação falhou:', validation.errors);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      } as AuthResponse);
      return;
    }

    // Check if user already exists
    console.log('🔍 Verificando se usuário já existe...');
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.warn('⚠️ Erro ao verificar usuário:', checkError);
    }

    if (existingUser) {
      console.warn('❌ Usuário já existe:', email);
      res.status(409).json({
        success: false,
        message: 'User already exists',
      } as AuthResponse);
      return;
    }

    // Hash password
    console.log('🔐 Hashando senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data using database column names (snake_case)
    const userData = {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Criando usuário no Supabase...');

    // Create user in Supabase users table
    // Use supabaseAdmin (with service role key) to bypass RLS
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('❌ ERRO AO CRIAR USUÁRIO:');
      console.error('   Código:', insertError?.code);
      console.error('   Mensagem:', insertError?.message);
      console.error('   Hint:', insertError?.hint);
      console.error('   Detalhes:', insertError?.details);
      
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: insertError?.message || 'Unknown error',
      } as any);
      return;
    }

    console.log('✅ Usuário criado com sucesso:', newUser.id);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      } as TokenPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    console.log('🎫 Token gerado para:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      },
      token,
    } as AuthResponse);
  } catch (error) {
    console.error('❌ ERRO NÃO TRATADO NO REGISTRO:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    } as AuthResponse);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateAuthRequest(email, password);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      } as AuthResponse);
      return;
    }

    // Find user - Using supabaseAdmin to ensure we can find the user regardless of RLS for login
    const { data: user, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (queryError || !user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } as AuthResponse);
      return;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } as AuthResponse);
      return;
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      } as TokenPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    } as AuthResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    } as AuthResponse);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      } as AuthResponse);
      return;
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as AuthResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    } as AuthResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    } as AuthResponse);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      } as AuthResponse);
      return;
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Name is required and must be a string',
      } as AuthResponse);
      return;
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error || !updatedUser) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      } as AuthResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    } as AuthResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    } as AuthResponse);
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      } as AuthResponse);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      } as AuthResponse);
      return;
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .maybeSingle();

    if (userError || !user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as AuthResponse);
      return;
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      } as AuthResponse);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id);

    if (updateError) {
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
      } as AuthResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
    } as AuthResponse);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    } as AuthResponse);
  }
};

/**
 * Health check
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
    });
  }
};
