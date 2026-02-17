import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase';
import { POCollectionResponse, POErrorResponse } from '../types';

/**
 * Get all users with PO UI pagination, filtering and sorting
 */
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, order, ...filters } = req.query;
    
    const pageNum = parseInt(page as string);
    const sizeNum = parseInt(pageSize as string);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum;

    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' });

    // Apply filters (property=value)
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        query = query.ilike(key, `%${filters[key]}%`);
      }
    });

    // Apply sorting (order=name,-age)
    if (order) {
      const orderParams = (order as string).split(',');
      orderParams.forEach(param => {
        const isDescending = param.startsWith('-');
        const column = isDescending ? param.substring(1) : param;
        query = query.order(column, { ascending: !isDescending });
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    const hasNext = count ? to < count : false;

    const response: POCollectionResponse<any> = {
      hasNext,
      items: data || []
    };

    res.json(response);
  } catch (error: any) {
    console.error('List users error:', error);
    res.status(500).json({
      code: 'ERR_LIST_USERS',
      message: 'Erro ao listar usuários',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * Get a single user by ID
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado',
        detailedMessage: `Nenhum usuário encontrado com o ID: ${id}`
      } as POErrorResponse);
      return;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_GET_USER',
      message: 'Erro ao buscar usuário',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Campos obrigatórios ausentes',
        detailedMessage: 'E-mail e senha são obrigatórios para criar um usuário.'
      } as POErrorResponse);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        res.status(409).json({
          code: 'USER_EXISTS',
          message: 'Usuário já existe',
          detailedMessage: 'Já existe um usuário cadastrado com este e-mail.'
        } as POErrorResponse);
        return;
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_CREATE_USER',
      message: 'Erro ao criar usuário',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    
    // Don't allow password update through this endpoint for security
    delete updateData.password;
    delete updateData.id;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado',
        detailedMessage: `Não foi possível atualizar: usuário com ID ${id} não existe.`
      } as POErrorResponse);
      return;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_UPDATE_USER',
      message: 'Erro ao atualizar usuário',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, status } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (status === 204 || status === 200) {
      res.status(204).send();
    } else {
      res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado',
        detailedMessage: `Não foi possível excluir: usuário com ID ${id} não existe.`
      } as POErrorResponse);
    }
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_DELETE_USER',
      message: 'Erro ao excluir usuário',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};
