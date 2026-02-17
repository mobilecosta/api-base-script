import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

type Primitive = string | number | boolean | null | undefined;
type RecordData = Record<string, Primitive | Primitive[] | Record<string, unknown> | unknown[]>;

type StructField = {
  field: string;
  title: string;
  type: 'C' | 'N' | 'D' | 'L' | 'M';
  size: number;
  required: boolean;
  editable: boolean;
  enabled: boolean;
  virtual: boolean;
  options: Array<{ value: string | number | boolean; label: string }>;
  decimals: number;
  exist_trigger: boolean;
  help: string;
  order: number;
  agrup?: string;
  folder?: string;
  standard_query?: string;
  standard_query_detail?: {
    lookup: string;
    get_column_value: string;
    columns: Array<{ field: string; title: string }>;
  };
};

type AliasSchema = {
  description: string;
  struct: StructField[];
  folders: Array<{ id: string; title: string }>;
  agrups: Array<{ id: string; title: string; order: number }>;
};

const nowIso = () => new Date().toISOString();

const toDateYmd = (isoDate: string) => isoDate.substring(0, 10).replace(/-/g, '');

const aliasIdFieldMap: Record<string, string> = {
  Z10: 'z10_cod',
  Z11: 'z11_cod',
  Z00: 'z00_cod',
  Z01: 'z01_prderp',
  Z02: 'z02_cod',
  Z04: 'z04_cod'
};

const aliasCodePrefixMap: Record<string, string> = {
  Z10: 'PLAT',
  Z11: 'ENV',
  Z00: 'ACC',
  Z01: 'PXA',
  Z02: 'INT',
  Z04: 'LOG'
};

type TableRow = {
  id: number;
  alias_code: string;
  description: string;
};

type TableFieldRow = {
  field_name: string;
  title: string;
  type: StructField['type'];
  size: number;
  required: boolean;
  editable: boolean;
  enabled: boolean;
  virtual: boolean;
  options: unknown;
  decimals: number;
  exist_trigger: boolean;
  help: string;
  field_order: number;
  agrup_code: string | null;
  folder_code: string | null;
  standard_query: string | null;
  standard_query_detail: StructField['standard_query_detail'] | null;
};

type TableFolderRow = { folder_code: string; title: string };
type TableAgrupRow = { agrup_code: string; title: string; agrup_order: number };

function field(
  name: string,
  title: string,
  type: StructField['type'],
  size: number,
  required: boolean,
  order: number,
  options: StructField['options'] = [],
  withDecimals = false,
  editable = true
): StructField {
  return {
    field: name,
    title,
    type,
    size,
    required,
    editable,
    enabled: true,
    virtual: false,
    options,
    decimals: withDecimals ? 2 : 0,
    exist_trigger: false,
    help: '',
    order
  };
}

const defaultAliasSchemas: Record<string, AliasSchema> = {
  Z10: {
    description: 'Plataformas',
    folders: [],
    agrups: [],
    struct: [
      field('Z10_COD', 'Codigo', 'C', 15, true, 1),
      field('Z10_DESC', 'Descricao', 'C', 60, true, 2),
      field('Z10_ATIVO', 'Ativo', 'C', 1, true, 3, [{ value: 'S', label: 'Ativo' }, { value: 'N', label: 'Inativo' }]),
      field('Z10_DTALT', 'Ultima Atualizacao', 'D', 8, false, 4, [], false, false)
    ]
  },
  Z11: {
    description: 'Programas de Envio',
    folders: [],
    agrups: [],
    struct: [
      field('Z11_COD', 'Codigo', 'C', 15, true, 1),
      field('Z11_DESC', 'Descricao', 'C', 60, true, 2),
      field('Z11_PRAZO', 'Prazo em Dias', 'N', 3, true, 3),
      field('Z11_ATIVO', 'Ativo', 'C', 1, true, 4, [{ value: 'S', label: 'Ativo' }, { value: 'N', label: 'Inativo' }])
    ]
  },
  Z00: {
    description: 'Contas de Marketplaces',
    folders: [],
    agrups: [],
    struct: [
      field('Z00_COD', 'Codigo', 'C', 15, true, 1),
      field('Z00_DESC', 'Descricao', 'C', 60, true, 2),
      field('Z00_TOKEN', 'Token', 'C', 120, true, 3),
      field('Z00_STATUS', 'Status', 'C', 1, true, 4, [{ value: 'A', label: 'Ativo' }, { value: 'I', label: 'Inativo' }])
    ]
  },
  Z01: {
    description: 'Produto x Conta',
    folders: [],
    agrups: [],
    struct: [
      field('Z01_COD', 'Codigo', 'C', 6, false, 1, [], false, false),
      field('Z01_PRDERP', 'Produto ERP', 'C', 20, true, 2),
      field('Z01_DESCER', 'Descricao ERP', 'C', 60, true, 3),
      field('Z01_CONTA', 'Conta Marketplace', 'C', 15, true, 4),
      field('Z01_SKU', 'SKU Marketplace', 'C', 30, true, 5),
      field('Z01_ATIVO', 'Ativo', 'C', 1, true, 6, [{ value: 'S', label: 'Ativo' }, { value: 'N', label: 'Inativo' }])
    ]
  },
  Z02: {
    description: 'Pedidos Integrados',
    folders: [],
    agrups: [],
    struct: [
      field('Z02_COD', 'Codigo', 'C', 15, true, 1, [], false, false),
      field('Z02_IDPED', 'Id Pedido', 'C', 25, true, 2),
      field('Z02_IDINT', 'Id Integracao', 'C', 25, true, 3),
      field('Z02_PEDIDO', 'Pedido ERP', 'C', 20, false, 4, [], false, false),
      field('Z02_CLIENT', 'Cliente', 'C', 10, false, 5),
      field('Z02_LOJA', 'Loja', 'C', 4, false, 6),
      field('Z02_STATUS', 'Status', 'C', 10, true, 7, [
        { value: 'NOVO', label: 'Novo' },
        { value: 'PROC', label: 'Processando' },
        { value: 'OK', label: 'Concluido' },
        { value: 'ERRO', label: 'Erro' }
      ]),
      field('Z02_ULTATT', 'Ultima Atualizacao', 'D', 8, false, 8, [], false, false)
    ]
  },
  Z03: {
    description: 'Itens Integrados',
    folders: [],
    agrups: [],
    struct: [
      field('Z03_ITEM', 'Item', 'C', 4, true, 1),
      field('Z03_PROD', 'Produto', 'C', 20, true, 2),
      field('Z03_DESC', 'Descricao', 'C', 60, false, 3),
      field('Z03_QTD', 'Quantidade', 'N', 10, true, 4),
      field('Z03_VLR', 'Valor', 'N', 15, true, 5, [], true)
    ]
  },
  Z04: {
    description: 'Log de Integracao',
    folders: [],
    agrups: [],
    struct: [
      field('Z04_COD', 'Codigo', 'C', 12, true, 1, [], false, false),
      field('Z04_DTHORA', 'Data Hora', 'D', 8, true, 2, [], false, false),
      field('Z04_TIPO', 'Tipo', 'C', 10, true, 3),
      field('Z04_STATUS', 'Status', 'C', 10, true, 4, [{ value: 'OK', label: 'Sucesso' }, { value: 'FALHA', label: 'Falha' }]),
      field('Z04_MSG', 'Mensagem', 'M', 200, false, 5, [], false, false)
    ]
  },
  Z05: {
    description: 'Pagamentos',
    folders: [],
    agrups: [],
    struct: [
      field('Z05_FORMA', 'Forma', 'C', 20, true, 1),
      field('Z05_VALOR', 'Valor', 'N', 15, true, 2, [], true),
      field('Z05_STATUS', 'Status', 'C', 12, true, 3),
      field('Z05_IDPED', 'Id Pedido', 'C', 25, false, 4, [], false, false),
      field('Z05_IDINT', 'Id Integracao', 'C', 25, false, 5, [], false, false)
    ]
  },
  Z06: {
    description: 'Faturamentos',
    folders: [],
    agrups: [],
    struct: [
      field('Z06_DOC', 'Documento', 'C', 20, true, 1),
      field('Z06_SERIE', 'Serie', 'C', 6, true, 2),
      field('Z06_VALOR', 'Valor', 'N', 15, true, 3, [], true),
      field('Z06_STATUS', 'Status', 'C', 12, true, 4),
      field('Z06_IDPED', 'Id Pedido', 'C', 25, false, 5, [], false, false),
      field('Z06_IDINT', 'Id Integracao', 'C', 25, false, 6, [], false, false)
    ]
  }
};

async function loadRowsWithFallback<T>(
  tableNames: string[],
  load: (tableName: string) => Promise<{ data: T[] | null; error: any }>
): Promise<T[]> {
  let lastError: any = null;
  for (const tableName of tableNames) {
    const { data, error } = await load(tableName);
    if (!error) return data || [];
    if (isMissingTableError(error)) {
      lastError = error;
      continue;
    }
    throw error;
  }
  throw lastError || new Error(`No compatible tables found: ${tableNames.join(', ')}`);
}

function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '').toUpperCase();
  const message = String(error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('could not find the table') ||
    message.includes('relation') && message.includes('does not exist')
  );
}

async function resolveTableName(tableNames: string[]): Promise<string> {
  let lastError: any = null;
  for (const tableName of tableNames) {
    const { error } = await supabaseAdmin.from(tableName).select('*').limit(1);
    if (!error) return tableName;
    if (isMissingTableError(error)) {
      lastError = error;
      continue;
    }
    throw error;
  }
  throw lastError || new Error(`No compatible tables found: ${tableNames.join(', ')}`);
}

async function getAliasSchemaFromDb(alias: string): Promise<AliasSchema | null> {
  const { data: tableData, error: tableError } = await supabaseAdmin
    .from('tables')
    .select('id, alias_code, description')
    .eq('alias_code', alias)
    .maybeSingle<TableRow>();

  if (tableError) throw tableError;
  if (!tableData) return null;

  const [fields, folders, agrups] = await Promise.all([
    loadRowsWithFallback<TableFieldRow>(['table_fields', 'tables_fields'], async tableName => {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select(
          'field_name, title, type, size, required, editable, enabled, virtual, options, decimals, exist_trigger, help, field_order, agrup_code, folder_code, standard_query, standard_query_detail'
        )
        .eq('table_id', tableData.id)
        .order('field_order', { ascending: true });
      return { data: data as TableFieldRow[] | null, error };
    }),
    loadRowsWithFallback<TableFolderRow>(['table_folders', 'tables_folders'], async tableName => {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('folder_code, title')
        .eq('table_id', tableData.id)
        .order('folder_code', { ascending: true });
      return { data: data as TableFolderRow[] | null, error };
    }),
    loadRowsWithFallback<TableAgrupRow>(['table_agrups', 'tables_agrups'], async tableName => {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('agrup_code, title, agrup_order')
        .eq('table_id', tableData.id)
        .order('agrup_order', { ascending: true });
      return { data: data as TableAgrupRow[] | null, error };
    })
  ]);

  return {
    description: tableData.description,
    struct: fields.map(row => ({
      field: row.field_name,
      title: row.title,
      type: row.type,
      size: row.size,
      required: row.required,
      editable: row.editable,
      enabled: row.enabled,
      virtual: row.virtual,
      options: Array.isArray(row.options) ? (row.options as StructField['options']) : [],
      decimals: row.decimals,
      exist_trigger: row.exist_trigger,
      help: row.help || '',
      order: row.field_order,
      agrup: row.agrup_code || undefined,
      folder: row.folder_code || undefined,
      standard_query: row.standard_query || undefined,
      standard_query_detail: row.standard_query_detail || undefined
    })),
    folders: folders.map(row => ({ id: row.folder_code, title: row.title })),
    agrups: agrups.map(row => ({ id: row.agrup_code, title: row.title, order: row.agrup_order }))
  };
}

function getAliasTableName(alias: string): string {
  return alias.toLowerCase();
}

function toUpperKeys(item: Record<string, any>): Record<string, any> {
  return Object.entries(item).reduce<Record<string, any>>((acc, [key, value]) => {
    acc[key.toUpperCase()] = value;
    return acc;
  }, {});
}

function toLowerKeys(item: Record<string, any>): Record<string, any> {
  return Object.entries(item).reduce<Record<string, any>>((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});
}

function generateCode(prefix: string): string {
  return `${prefix}${Date.now().toString().slice(-6)}`;
}

async function fetchAliasRows(alias: string): Promise<Array<Record<string, any>>> {
  const tableName = getAliasTableName(alias);
  const { data, error } = await supabaseAdmin.from(tableName).select('*');
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return (data || []).map(row => toUpperKeys(row as Record<string, any>));
}

function resolveRecordId(alias: string, item: Record<string, any>): string {
  const idField = aliasIdFieldMap[alias.toUpperCase()] || `${alias.toLowerCase()}_cod`;
  const idValue = item[idField.toUpperCase()] ?? item[idField] ?? '';
  return String(idValue || '');
}

async function deleteByField(tableName: string, field: string, value: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .delete()
    .eq(field, value)
    .select(field);
  if (error) throw error;
  return (data || []).length;
}

async function updateByField(
  tableName: string,
  field: string,
  value: string,
  payload: Record<string, any>
): Promise<Record<string, any> | null> {
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .update(payload)
    .eq(field, value)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? toUpperKeys(data as Record<string, any>) : null;
}

async function insertOne(tableName: string, payload: Record<string, any>): Promise<Record<string, any>> {
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return toUpperKeys(data as Record<string, any>);
}

function applyFilter(items: Array<Record<string, any>>, filter: string): Array<Record<string, any>> {
  if (!filter || !filter.trim()) return items;
  const q = filter.toLowerCase();
  return items.filter(item =>
    Object.values(item).some(value => String(value ?? '').toLowerCase().includes(q))
  );
}

function applyOrder(items: Array<Record<string, any>>, orderValue: string): Array<Record<string, any>> {
  if (!orderValue || !orderValue.trim()) return items;
  const tokens = orderValue.trim().split(/\s+/);
  const fieldName = tokens[0];
  const desc = (tokens[1] || '').toUpperCase() === 'DESC';
  return [...items].sort((a, b) => {
    const av = String(a[fieldName] ?? '');
    const bv = String(b[fieldName] ?? '');
    if (av === bv) return 0;
    if (desc) return av < bv ? 1 : -1;
    return av > bv ? 1 : -1;
  });
}

function normalizeBody(body: any): Record<string, any> {
  if (!body || typeof body !== 'object') return {};
  const keys = Object.keys(body);
  const formKey = keys.find(key => key.startsWith('FORM'));
  if (formKey && typeof body[formKey] === 'object' && body[formKey] !== null) {
    return body[formKey] as Record<string, any>;
  }
  return body as Record<string, any>;
}

function parseJsonFromPath(rawParam: string): any {
  try {
    const decoded = decodeURIComponent(rawParam || '');
    const sanitized = decoded.replace(/}+\s*$/, '}');
    return JSON.parse(sanitized);
  } catch {
    return null;
  }
}

function normalizeAliasSchemasPayload(body: Record<string, any>): Record<string, AliasSchema> {
  if (body && body.aliasSchemas && typeof body.aliasSchemas === 'object' && !Array.isArray(body.aliasSchemas)) {
    return body.aliasSchemas as Record<string, AliasSchema>;
  }
  if (body && Array.isArray(body.schemas)) {
    const mapped = body.schemas.reduce<Record<string, AliasSchema>>((acc, item: any) => {
      const alias = String(item?.alias || '').toUpperCase();
      if (!alias || !item?.description || !Array.isArray(item?.struct)) return acc;
      acc[alias] = {
        description: String(item.description),
        struct: item.struct,
        folders: Array.isArray(item.folders) ? item.folders : [],
        agrups: Array.isArray(item.agrups) ? item.agrups : []
      };
      return acc;
    }, {});
    if (Object.keys(mapped).length > 0) return mapped;
  }
  return {};
}

export const syncDictionarySchemas = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = normalizeBody(req.body);
    const useSeed = String(body.useSeed || '').toLowerCase() === 'true' || body.useSeed === true;
    const providedSchemas = normalizeAliasSchemasPayload(body);
    const schemas = Object.keys(providedSchemas).length > 0 ? providedSchemas : (useSeed ? defaultAliasSchemas : {});

    if (Object.keys(schemas).length === 0) {
      res.status(400).json({
        message: 'No schemas provided. Send aliasSchemas/schemas in request body or use useSeed=true.'
      });
      return;
    }

    const [fieldsTableName, foldersTableName, agrupsTableName] = await Promise.all([
      resolveTableName(['table_fields', 'tables_fields']),
      resolveTableName(['table_folders', 'tables_folders']),
      resolveTableName(['table_agrups', 'tables_agrups'])
    ]);

    const results: Array<{ alias: string; tableId: number; fields: number; folders: number; agrups: number }> = [];

    for (const [aliasRaw, schema] of Object.entries(schemas)) {
      const alias = aliasRaw.toUpperCase();
      const description = String(schema.description || '').trim();
      if (!description) continue;

      const { data: upsertedTable, error: upsertTableError } = await supabaseAdmin
        .from('tables')
        .upsert(
          {
            alias_code: alias,
            description,
            updated_at: nowIso()
          },
          { onConflict: 'alias_code' }
        )
        .select('id')
        .single<{ id: number }>();

      if (upsertTableError) throw upsertTableError;
      const tableId = upsertedTable.id;

      const [deleteFields, deleteFolders, deleteAgrups] = await Promise.all([
        supabaseAdmin.from(fieldsTableName).delete().eq('table_id', tableId),
        supabaseAdmin.from(foldersTableName).delete().eq('table_id', tableId),
        supabaseAdmin.from(agrupsTableName).delete().eq('table_id', tableId)
      ]);

      if (deleteFields.error) throw deleteFields.error;
      if (deleteFolders.error) throw deleteFolders.error;
      if (deleteAgrups.error) throw deleteAgrups.error;

      const foldersPayload = (schema.folders || []).map(folder => ({
        table_id: tableId,
        folder_code: String(folder.id),
        title: String(folder.title || '')
      }));
      if (foldersPayload.length > 0) {
        const { error } = await supabaseAdmin.from(foldersTableName).insert(foldersPayload);
        if (error) throw error;
      }

      const agrupsPayload = (schema.agrups || []).map(agrup => ({
        table_id: tableId,
        agrup_code: String(agrup.id),
        title: String(agrup.title || ''),
        agrup_order: Number(agrup.order || 0)
      }));
      if (agrupsPayload.length > 0) {
        const { error } = await supabaseAdmin.from(agrupsTableName).insert(agrupsPayload);
        if (error) throw error;
      }

      const fieldsPayload = (schema.struct || []).map(col => ({
        table_id: tableId,
        field_name: String(col.field),
        title: String(col.title || ''),
        type: col.type,
        size: Number(col.size || 0),
        required: Boolean(col.required),
        editable: col.editable !== false,
        enabled: col.enabled !== false,
        virtual: Boolean(col.virtual),
        options: Array.isArray(col.options) ? col.options : [],
        decimals: Number(col.decimals || 0),
        exist_trigger: Boolean(col.exist_trigger),
        help: String(col.help || ''),
        field_order: Number(col.order || 0),
        agrup_code: col.agrup ? String(col.agrup) : null,
        folder_code: col.folder ? String(col.folder) : null,
        standard_query: col.standard_query || null,
        standard_query_detail: col.standard_query_detail || null
      }));
      if (fieldsPayload.length > 0) {
        const { error } = await supabaseAdmin.from(fieldsTableName).insert(fieldsPayload);
        if (error) throw error;
      }

      results.push({
        alias,
        tableId,
        fields: fieldsPayload.length,
        folders: foldersPayload.length,
        agrups: agrupsPayload.length
      });
    }

    res.json({
      success: true,
      synced: results.length,
      childrenTables: {
        fields: fieldsTableName,
        folders: foldersTableName,
        agrups: agrupsTableName
      },
      results
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error synchronizing dictionary schemas',
      detailedMessage: error.message
    });
  }
};

export const getBrowseColumns = async (req: Request, res: Response): Promise<void> => {
  try {
    const alias = String(req.params.alias || '').toUpperCase();
    const schema = await getAliasSchemaFromDb(alias);

    if (!schema) {
      res.status(404).json({ message: `Alias not found: ${alias}` });
      return;
    }

    res.json(schema);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error loading browse columns from database',
      detailedMessage: error.message
    });
  }
};

export const getBrowseItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const alias = String(req.params.alias || '').toUpperCase();
    const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
    const pageSize = Math.max(parseInt(String(req.query.pageSize || '10'), 10) || 10, 1);
    const filter = String(req.query.filter || '');
    const order = String(req.query.$order || '');

    let items = await fetchAliasRows(alias);
    items = applyFilter(items, filter);
    items = applyOrder(items, order);

    const total = items.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedItems = items.slice(start, end);
    const remainingRecords = Math.max(total - end, 0);

    res.json({
      hasNext: end < total,
      remainingRecords,
      items: pagedItems
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error loading browse items from database',
      detailedMessage: error.message
    });
  }
};

export const getStructAlias = async (req: Request, res: Response): Promise<void> => {
  try {
    const alias = String(req.params.alias || '').toUpperCase();
    const schema = await getAliasSchemaFromDb(alias);
    if (!schema) {
      res.status(404).json({ message: `Alias not found: ${alias}` });
      return;
    }
    res.json(schema);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error loading struct alias from database',
      detailedMessage: error.message
    });
  }
};

export const getDictionaryData = async (req: Request, res: Response): Promise<void> => {
  try {
    const alias = String(req.params.alias || '').toUpperCase();
    const rawItem = String(req.params.item || '');
    const payload = parseJsonFromPath(rawItem);

    const positioned = payload?.item || payload || {};
    const items = await fetchAliasRows(alias);
    if (items.length === 0) {
      res.json({});
      return;
    }

    const positionedCode = resolveRecordId(alias, positioned);
    const found = positionedCode ? items.find(item => resolveRecordId(alias, item) === positionedCode) : null;
    res.json(found || items[0]);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error loading dictionary data from database',
      detailedMessage: error.message
    });
  }
};

export const getDictionaryInitializer = async (req: Request, res: Response): Promise<void> => {
  try {
    const alias = String(req.params.alias || '').toUpperCase();
    const schema = await getAliasSchemaFromDb(alias);

    if (!schema) {
      res.status(404).json({ message: `Alias not found: ${alias}` });
      return;
    }

    const initial = schema.struct.reduce<Record<string, any>>((acc, col) => {
      if (col.options.length > 0) {
        acc[col.field] = col.options[0].value;
        return acc;
      }
      if (col.type === 'N') {
        acc[col.field] = 0;
        return acc;
      }
      if (col.type === 'D') {
        acc[col.field] = toDateYmd(nowIso());
        return acc;
      }
      if (col.type === 'L') {
        acc[col.field] = false;
        return acc;
      }
      acc[col.field] = '';
      return acc;
    }, {});

    res.json(initial);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error building dictionary initializer from database',
      detailedMessage: error.message
    });
  }
};

export const executeTrigger = (req: Request, res: Response): void => {
  const body = normalizeBody(req.body);
  res.json(body);
};

export const getLookup = async (req: Request, res: Response): Promise<void> => {
  try {
    const table = String(req.params.ctabela || '').toUpperCase();
    const filter = String(req.query.filter || '').toLowerCase();

    if (table !== 'SA1' && table !== 'Z02') {
      res.json([]);
      return;
    }

    const dbTable = table.toLowerCase();
    const { data, error } = await supabaseAdmin.from(dbTable).select('*');
    if (error) {
      if (isMissingTableError(error)) {
        res.json([]);
        return;
      }
      throw error;
    }

    const rows = (data || []).map(row => toUpperKeys(row as Record<string, any>));
    const filtered = rows.filter(item => !filter || Object.values(item).some(v => String(v).toLowerCase().includes(filter)));
    if (table === 'Z02') {
      res.json(filtered.map(item => ({ z02_cod: item.Z02_COD, z02_idped: item.Z02_IDPED })));
      return;
    }
    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error loading lookup from database',
      detailedMessage: error.message
    });
  }
};

export const getLookupById = async (req: Request, res: Response): Promise<void> => {
  try {
    const table = String(req.params.ctabela || '').toUpperCase();
    const id = String(req.params.id || '');

    if (table !== 'SA1' && table !== 'Z02') {
      res.json([]);
      return;
    }

    const dbTable = table.toLowerCase();
    const idField = table === 'SA1' ? 'a1_cod' : 'z02_cod';
    const { data, error } = await supabaseAdmin.from(dbTable).select('*').eq(idField, id);
    if (error) {
      if (isMissingTableError(error)) {
        res.json([]);
        return;
      }
      throw error;
    }
    const rows = (data || []).map(row => toUpperKeys(row as Record<string, any>));
    if (table === 'Z02') {
      res.json(rows.map(row => ({ z02_cod: row.Z02_COD, z02_idped: row.Z02_IDPED })));
      return;
    }
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error loading lookup by id from database',
      detailedMessage: error.message
    });
  }
};

export const postPlatforms = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = normalizeBody(req.body);
    const code = String(payload.Z10_COD || generateCode(aliasCodePrefixMap.Z10));
    const item = { ...payload, Z10_COD: code, Z10_DTALT: toDateYmd(nowIso()) };
    const created = await insertOne('z10', toLowerKeys(item));
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating platform', detailedMessage: error.message });
  }
};

export const putPlatforms = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const payload = normalizeBody(req.body);
    const updated = await updateByField('z10', 'z10_cod', id, toLowerKeys({ ...payload, Z10_COD: id, Z10_DTALT: toDateYmd(nowIso()) }));
    if (!updated) {
      res.status(404).json({ message: 'Platform not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating platform', detailedMessage: error.message });
  }
};

export const deletePlatforms = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const deleted = await deleteByField('z10', 'z10_cod', id);
    if (!deleted) {
      res.status(404).json({ message: 'Platform not found' });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting platform', detailedMessage: error.message });
  }
};

export const postShippingProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = normalizeBody(req.body);
    const code = String(payload.Z11_COD || generateCode(aliasCodePrefixMap.Z11));
    const item = { ...payload, Z11_COD: code };
    const created = await insertOne('z11', toLowerKeys(item));
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating shipping program', detailedMessage: error.message });
  }
};

export const putShippingProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const payload = normalizeBody(req.body);
    const updated = await updateByField('z11', 'z11_cod', id, toLowerKeys({ ...payload, Z11_COD: id }));
    if (!updated) {
      res.status(404).json({ message: 'Shipping program not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating shipping program', detailedMessage: error.message });
  }
};

export const deleteShippingProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const deleted = await deleteByField('z11', 'z11_cod', id);
    if (!deleted) {
      res.status(404).json({ message: 'Shipping program not found' });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting shipping program', detailedMessage: error.message });
  }
};

export const postMarketplacesAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = normalizeBody(req.body);
    const code = String(payload.Z00_COD || generateCode(aliasCodePrefixMap.Z00));
    const item = { ...payload, Z00_COD: code };
    const created = await insertOne('z00', toLowerKeys(item));
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating marketplace account', detailedMessage: error.message });
  }
};

export const putMarketplacesAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const payload = normalizeBody(req.body);
    const updated = await updateByField('z00', 'z00_cod', id, toLowerKeys({ ...payload, Z00_COD: id }));
    if (!updated) {
      res.status(404).json({ message: 'Marketplace account not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating marketplace account', detailedMessage: error.message });
  }
};

export const deleteMarketplacesAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const deleted = await deleteByField('z00', 'z00_cod', id);
    if (!deleted) {
      res.status(404).json({ message: 'Marketplace account not found' });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting marketplace account', detailedMessage: error.message });
  }
};

export const postProductXAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = normalizeBody(req.body);
    const base = { ...payload };
    const items = Array.isArray(payload.ITENS) ? payload.ITENS : [];

    if (items.length > 0) {
      if (!payload.Z01_PRDERP) {
        res.status(400).json({ message: 'Z01_PRDERP is required when ITENS is informed' });
        return;
      }
      await supabaseAdmin.from('z01').delete().eq('z01_prderp', String(payload.Z01_PRDERP));
      const rows = items.map((item: any, idx: number) => toLowerKeys({ ...base, ...item, Z01_COD: String(idx + 1) }));
      const { error } = await supabaseAdmin.from('z01').insert(rows);
      if (error) throw error;
      res.status(201).json({ success: true });
      return;
    }

    const row = toLowerKeys({
      ...base,
      Z01_COD: String(payload.Z01_COD || generateCode(aliasCodePrefixMap.Z01))
    });
    const { error } = await supabaseAdmin.from('z01').insert(row);
    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating product x accounts', detailedMessage: error.message });
  }
};

export const getProductXAccountsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const { data, error } = await supabaseAdmin.from('z01').select('*').eq('z01_prderp', id);
    if (error) throw error;
    res.json({ items: (data || []).map(row => toUpperKeys(row as Record<string, any>)) });
  } catch (error: any) {
    res.status(500).json({ message: 'Error loading product x accounts', detailedMessage: error.message });
  }
};

export const deleteProductXAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const deleted = await deleteByField('z01', 'z01_prderp', id);
    if (!deleted) {
      res.status(404).json({ message: 'Product x account not found' });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting product x account', detailedMessage: error.message });
  }
};

export const getIntegratedOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const idPed = String(req.params.idPed || '');
    const idInt = String(req.params.idInt || '');

    const [z03Res, z05Res, z06Res] = await Promise.all([
      supabaseAdmin.from('z03').select('*').eq('z03_idped', idPed).eq('z03_idint', idInt),
      supabaseAdmin.from('z05').select('*').eq('z05_idped', idPed).eq('z05_idint', idInt),
      supabaseAdmin.from('z06').select('*').eq('z06_idped', idPed).eq('z06_idint', idInt)
    ]);

    if (z03Res.error && !isMissingTableError(z03Res.error)) throw z03Res.error;
    if (z05Res.error && !isMissingTableError(z05Res.error)) throw z05Res.error;
    if (z06Res.error && !isMissingTableError(z06Res.error)) throw z06Res.error;

    res.json({
      Z03: (z03Res.data || []).map(row => toUpperKeys(row as Record<string, any>)),
      Z05: (z05Res.data || []).map(row => toUpperKeys(row as Record<string, any>)),
      Z06: (z06Res.data || []).map(row => toUpperKeys(row as Record<string, any>))
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error loading integrated orders', detailedMessage: error.message });
  }
};
