import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseClient, supabaseAdmin } from '../config/supabase';
import { validateAuthRequest, validateEmail, validatePassword } from '../utils/validation';
import { AuthResponse, User, TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

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

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists',
      } as AuthResponse);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase users table
    const { data: newUser, error: insertError } = await supabaseClient
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('Register error:', insertError);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
      } as AuthResponse);
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
    console.error('Register error:', error);
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

    // Find user
    const { data: user, error: queryError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

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
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
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

    const { data: user, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

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

    const { data: updatedUser, error } = await supabaseClient
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

    if (!validatePassword(newPassword)) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      } as AuthResponse);
      return;
    }

    // Get user
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

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
    const { error: updateError } = await supabaseClient
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
