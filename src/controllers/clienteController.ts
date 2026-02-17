import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { POCollectionResponse, POErrorResponse } from '../types';

/**
 * GET /api/clientes
 * PO UI collection pattern:
 * - page
 * - pageSize
 * - order=name,-created_at
 * - dynamic filters by query keys
 */
export const listClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, order, ...filters } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const sizeNum = Math.max(parseInt(pageSize as string, 10) || 10, 1);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum;

    let query = supabaseAdmin
      .from('clientes')
      .select('*', { count: 'exact' });

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        query = query.ilike(key, `%${filters[key]}%`);
      }
    });

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

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const hasNext = count ? to < count : false;
    const response: POCollectionResponse<any> = {
      hasNext,
      total: count || 0,
      items: data || []
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_LIST_CLIENTES',
      message: 'Erro ao listar clientes',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * GET /api/clientes/:id
 */
export const getCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      res.status(404).json({
        code: 'CLIENTE_NOT_FOUND',
        message: 'Cliente não encontrado',
        detailedMessage: `Nenhum cliente encontrado com o ID: ${id}`
      } as POErrorResponse);
      return;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_GET_CLIENTE',
      message: 'Erro ao buscar cliente',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * POST /api/clientes
 */
export const createCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { codigo, nome, ativo = true } = req.body;

    if (!codigo || !nome) {
      res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Campos obrigatórios ausentes',
        detailedMessage: 'codigo e nome são obrigatórios para criar um cliente.'
      } as POErrorResponse);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([{
        codigo: String(codigo).trim(),
        nome: String(nome).trim(),
        ativo: Boolean(ativo),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({
          code: 'CLIENTE_EXISTS',
          message: 'Cliente já existe',
          detailedMessage: 'Já existe um cliente com este código.'
        } as POErrorResponse);
        return;
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_CREATE_CLIENTE',
      message: 'Erro ao criar cliente',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * PUT /api/clientes/:id
 */
export const updateCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    delete updateData.id;
    delete updateData.created_at;

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      res.status(404).json({
        code: 'CLIENTE_NOT_FOUND',
        message: 'Cliente não encontrado',
        detailedMessage: `Não foi possível atualizar: cliente com ID ${id} não existe.`
      } as POErrorResponse);
      return;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_UPDATE_CLIENTE',
      message: 'Erro ao atualizar cliente',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};

/**
 * DELETE /api/clientes/:id
 */
export const deleteCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, status } = await supabaseAdmin
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (status === 204 || status === 200) {
      res.status(204).send();
      return;
    }

    res.status(404).json({
      code: 'CLIENTE_NOT_FOUND',
      message: 'Cliente não encontrado',
      detailedMessage: `Não foi possível excluir: cliente com ID ${id} não existe.`
    } as POErrorResponse);
  } catch (error: any) {
    res.status(500).json({
      code: 'ERR_DELETE_CLIENTE',
      message: 'Erro ao excluir cliente',
      detailedMessage: error.message
    } as POErrorResponse);
  }
};
