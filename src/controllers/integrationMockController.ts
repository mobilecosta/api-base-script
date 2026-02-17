import { Request, Response } from 'express';

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

const mockStore = {
  platforms: [
    { Z10_COD: 'PLAT001', Z10_DESC: 'Mercado Livre', Z10_ATIVO: 'S', Z10_DTALT: toDateYmd(nowIso()) },
    { Z10_COD: 'PLAT002', Z10_DESC: 'Shopee', Z10_ATIVO: 'S', Z10_DTALT: toDateYmd(nowIso()) }
  ] as Array<Record<string, any>>,
  shippingPrograms: [
    { Z11_COD: 'ENV001', Z11_DESC: 'Entrega Expressa', Z11_PRAZO: 2, Z11_ATIVO: 'S' },
    { Z11_COD: 'ENV002', Z11_DESC: 'Entrega Economica', Z11_PRAZO: 6, Z11_ATIVO: 'S' }
  ] as Array<Record<string, any>>,
  marketplacesAccounts: [
    { Z00_COD: 'ACC001', Z00_DESC: 'Conta Principal ML', Z00_TOKEN: 'token-ml-001', Z00_STATUS: 'A' },
    { Z00_COD: 'ACC002', Z00_DESC: 'Conta Shopee Sul', Z00_TOKEN: 'token-shp-002', Z00_STATUS: 'A' }
  ] as Array<Record<string, any>>,
  productXAccounts: [
    { Z01_COD: '1', Z01_PRDERP: 'PRD001', Z01_DESCER: 'Camisa Polo', Z01_CONTA: 'ACC001', Z01_SKU: 'SKU-ML-001', Z01_ATIVO: 'S' },
    { Z01_COD: '2', Z01_PRDERP: 'PRD001', Z01_DESCER: 'Camisa Polo', Z01_CONTA: 'ACC002', Z01_SKU: 'SKU-SHP-044', Z01_ATIVO: 'S' },
    { Z01_COD: '3', Z01_PRDERP: 'PRD002', Z01_DESCER: 'Tenis Esportivo', Z01_CONTA: 'ACC001', Z01_SKU: 'SKU-ML-777', Z01_ATIVO: 'S' }
  ] as Array<Record<string, any>>,
  integratedOrders: [
    {
      Z02_COD: 'INT001',
      Z02_IDPED: 'PED-1001',
      Z02_IDINT: 'I1001',
      Z02_PEDIDO: '4500012345',
      Z02_CLIENT: '000001',
      Z02_LOJA: '01',
      Z02_STATUS: 'PROC',
      Z02_ULTATT: toDateYmd(nowIso())
    },
    {
      Z02_COD: 'INT002',
      Z02_IDPED: 'PED-1002',
      Z02_IDINT: 'I1002',
      Z02_PEDIDO: '4500012346',
      Z02_CLIENT: '000002',
      Z02_LOJA: '01',
      Z02_STATUS: 'NOVO',
      Z02_ULTATT: toDateYmd(nowIso())
    }
  ] as Array<Record<string, any>>,
  processingLogs: [
    { Z04_COD: 'LOG001', Z04_DTHORA: toDateYmd(nowIso()), Z04_TIPO: 'INFO', Z04_STATUS: 'OK', Z04_MSG: 'Integracao concluida' },
    { Z04_COD: 'LOG002', Z04_DTHORA: toDateYmd(nowIso()), Z04_TIPO: 'ERRO', Z04_STATUS: 'FALHA', Z04_MSG: 'Falha no envio para marketplace' }
  ] as Array<Record<string, any>>,
  integratedItems: {
    'PED-1001|I1001': {
      Z03: [
        { Z03_ITEM: '001', Z03_PROD: 'PRD001', Z03_DESC: 'Camisa Polo', Z03_QTD: 2, Z03_VLR: 99.9 }
      ],
      Z05: [
        { Z05_FORMA: 'PIX', Z05_VALOR: 199.8, Z05_STATUS: 'PAGO' }
      ],
      Z06: [
        { Z06_DOC: 'NF001', Z06_SERIE: '1', Z06_VALOR: 199.8, Z06_STATUS: 'EMITIDO' }
      ]
    }
  } as Record<string, { Z03: Array<Record<string, any>>; Z05: Array<Record<string, any>>; Z06: Array<Record<string, any>> }>,
  sa1: [
    { a1_cod: '000001', a1_loja: '01', a1_nome: 'Cliente Mock 1' },
    { a1_cod: '000002', a1_loja: '01', a1_nome: 'Cliente Mock 2' },
    { a1_cod: '000003', a1_loja: '02', a1_nome: 'Cliente Mock 3' }
  ] as Array<Record<string, any>>
};

const aliasSchemas: Record<string, AliasSchema> = {
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

function getAliasData(alias: string): Array<Record<string, any>> {
  const key = alias.toUpperCase();
  switch (key) {
    case 'Z10':
      return mockStore.platforms;
    case 'Z11':
      return mockStore.shippingPrograms;
    case 'Z00':
      return mockStore.marketplacesAccounts;
    case 'Z01':
      return mockStore.productXAccounts;
    case 'Z02':
      return mockStore.integratedOrders;
    case 'Z04':
      return mockStore.processingLogs;
    default:
      return [];
  }
}

function resolveRecordId(alias: string, item: Record<string, any>): string {
  const key = alias.toUpperCase();
  switch (key) {
    case 'Z10':
      return String(item.Z10_COD || '');
    case 'Z11':
      return String(item.Z11_COD || '');
    case 'Z00':
      return String(item.Z00_COD || '');
    case 'Z01':
      return String(item.Z01_PRDERP || item.Z01_COD || '');
    case 'Z02':
      return String(item.Z02_COD || '');
    case 'Z04':
      return String(item.Z04_COD || '');
    default:
      return '';
  }
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

export const getBrowseColumns = (req: Request, res: Response): void => {
  const alias = String(req.params.alias || '').toUpperCase();
  const schema = aliasSchemas[alias];

  if (!schema) {
    res.status(404).json({ message: `Alias not found: ${alias}` });
    return;
  }

  res.json(schema);
};

export const getBrowseItems = (req: Request, res: Response): void => {
  const alias = String(req.params.alias || '').toUpperCase();
  const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
  const pageSize = Math.max(parseInt(String(req.query.pageSize || '10'), 10) || 10, 1);
  const filter = String(req.query.filter || '');
  const order = String(req.query.$order || '');

  let items = getAliasData(alias);
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
};

export const getStructAlias = (req: Request, res: Response): void => {
  const alias = String(req.params.alias || '').toUpperCase();
  const schema = aliasSchemas[alias];
  if (!schema) {
    res.status(404).json({ message: `Alias not found: ${alias}` });
    return;
  }
  res.json(schema);
};

export const getDictionaryData = (req: Request, res: Response): void => {
  const alias = String(req.params.alias || '').toUpperCase();
  const rawItem = String(req.params.item || '');
  const payload = parseJsonFromPath(rawItem);

  const positioned = payload?.item || payload || {};
  const items = getAliasData(alias);
  if (items.length === 0) {
    res.json({});
    return;
  }

  const positionedCode = resolveRecordId(alias, positioned);
  const found = positionedCode ? items.find(item => resolveRecordId(alias, item) === positionedCode) : null;
  res.json(found || items[0]);
};

export const getDictionaryInitializer = (req: Request, res: Response): void => {
  const alias = String(req.params.alias || '').toUpperCase();
  const schema = aliasSchemas[alias];

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
};

export const executeTrigger = (req: Request, res: Response): void => {
  const body = normalizeBody(req.body);
  res.json(body);
};

export const getLookup = (req: Request, res: Response): void => {
  const table = String(req.params.ctabela || '').toUpperCase();
  const filter = String(req.query.filter || '').toLowerCase();

  if (table !== 'SA1' && table !== 'Z02') {
    res.json([]);
    return;
  }

  if (table === 'SA1') {
    const rows = mockStore.sa1.filter(item =>
      !filter || Object.values(item).some(v => String(v).toLowerCase().includes(filter))
    );
    res.json(rows);
    return;
  }

  const rows = mockStore.integratedOrders
    .filter(item => !filter || String(item.Z02_COD).toLowerCase().includes(filter))
    .map(item => ({
      z02_cod: item.Z02_COD,
      z02_idped: item.Z02_IDPED
    }));
  res.json(rows);
};

export const getLookupById = (req: Request, res: Response): void => {
  const table = String(req.params.ctabela || '').toUpperCase();
  const id = String(req.params.id || '');

  if (table === 'SA1') {
    const row = mockStore.sa1.find(item => item.a1_cod === id);
    res.json(row ? [row] : []);
    return;
  }

  if (table === 'Z02') {
    const row = mockStore.integratedOrders.find(item => item.Z02_COD === id);
    res.json(row ? [{ z02_cod: row.Z02_COD, z02_idped: row.Z02_IDPED }] : []);
    return;
  }

  res.json([]);
};

export const postPlatforms = (req: Request, res: Response): void => {
  const payload = normalizeBody(req.body);
  const code = String(payload.Z10_COD || `PLAT${String(mockStore.platforms.length + 1).padStart(3, '0')}`);
  const item = { ...payload, Z10_COD: code, Z10_DTALT: toDateYmd(nowIso()) };
  mockStore.platforms.push(item);
  res.status(201).json(item);
};

export const putPlatforms = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const payload = normalizeBody(req.body);
  const idx = mockStore.platforms.findIndex(item => item.Z10_COD === id);
  if (idx < 0) {
    res.status(404).json({ message: 'Platform not found' });
    return;
  }
  mockStore.platforms[idx] = { ...mockStore.platforms[idx], ...payload, Z10_COD: id, Z10_DTALT: toDateYmd(nowIso()) };
  res.json(mockStore.platforms[idx]);
};

export const deletePlatforms = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const before = mockStore.platforms.length;
  mockStore.platforms = mockStore.platforms.filter(item => item.Z10_COD !== id);
  if (mockStore.platforms.length === before) {
    res.status(404).json({ message: 'Platform not found' });
    return;
  }
  res.status(204).send();
};

export const postShippingProgram = (req: Request, res: Response): void => {
  const payload = normalizeBody(req.body);
  const code = String(payload.Z11_COD || `ENV${String(mockStore.shippingPrograms.length + 1).padStart(3, '0')}`);
  const item = { ...payload, Z11_COD: code };
  mockStore.shippingPrograms.push(item);
  res.status(201).json(item);
};

export const putShippingProgram = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const payload = normalizeBody(req.body);
  const idx = mockStore.shippingPrograms.findIndex(item => item.Z11_COD === id);
  if (idx < 0) {
    res.status(404).json({ message: 'Shipping program not found' });
    return;
  }
  mockStore.shippingPrograms[idx] = { ...mockStore.shippingPrograms[idx], ...payload, Z11_COD: id };
  res.json(mockStore.shippingPrograms[idx]);
};

export const deleteShippingProgram = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const before = mockStore.shippingPrograms.length;
  mockStore.shippingPrograms = mockStore.shippingPrograms.filter(item => item.Z11_COD !== id);
  if (mockStore.shippingPrograms.length === before) {
    res.status(404).json({ message: 'Shipping program not found' });
    return;
  }
  res.status(204).send();
};

export const postMarketplacesAccounts = (req: Request, res: Response): void => {
  const payload = normalizeBody(req.body);
  const code = String(payload.Z00_COD || `ACC${String(mockStore.marketplacesAccounts.length + 1).padStart(3, '0')}`);
  const item = { ...payload, Z00_COD: code };
  mockStore.marketplacesAccounts.push(item);
  res.status(201).json(item);
};

export const putMarketplacesAccounts = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const payload = normalizeBody(req.body);
  const idx = mockStore.marketplacesAccounts.findIndex(item => item.Z00_COD === id || item.Z02_COD === id || item.Z04_COD === id);
  if (idx < 0) {
    res.status(404).json({ message: 'Marketplace account not found' });
    return;
  }
  mockStore.marketplacesAccounts[idx] = { ...mockStore.marketplacesAccounts[idx], ...payload, Z00_COD: id };
  res.json(mockStore.marketplacesAccounts[idx]);
};

export const deleteMarketplacesAccounts = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const before = mockStore.marketplacesAccounts.length;
  mockStore.marketplacesAccounts = mockStore.marketplacesAccounts.filter(item => item.Z00_COD !== id);
  if (mockStore.marketplacesAccounts.length === before) {
    res.status(404).json({ message: 'Marketplace account not found' });
    return;
  }
  res.status(204).send();
};

export const postProductXAccounts = (req: Request, res: Response): void => {
  const payload = normalizeBody(req.body);
  const base = { ...payload };
  const items = Array.isArray(payload.ITENS) ? payload.ITENS : [];

  if (items.length > 0) {
    mockStore.productXAccounts = mockStore.productXAccounts.filter(item => item.Z01_PRDERP !== payload.Z01_PRDERP);
    items.forEach((item: any, idx: number) => {
      mockStore.productXAccounts.push({
        ...base,
        ...item,
        Z01_COD: String(idx + 1)
      });
    });
  } else {
    mockStore.productXAccounts.push({
      ...base,
      Z01_COD: String(mockStore.productXAccounts.length + 1)
    });
  }

  res.status(201).json({ success: true });
};

export const getProductXAccountsById = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const items = mockStore.productXAccounts.filter(item => item.Z01_PRDERP === id);
  res.json({ items });
};

export const deleteProductXAccounts = (req: Request, res: Response): void => {
  const id = String(req.params.id || '');
  const before = mockStore.productXAccounts.length;
  mockStore.productXAccounts = mockStore.productXAccounts.filter(item => item.Z01_PRDERP !== id);
  if (mockStore.productXAccounts.length === before) {
    res.status(404).json({ message: 'Product x account not found' });
    return;
  }
  res.status(204).send();
};

export const getIntegratedOrders = (req: Request, res: Response): void => {
  const idPed = String(req.params.idPed || '');
  const idInt = String(req.params.idInt || '');
  const key = `${idPed}|${idInt}`;
  const data = mockStore.integratedItems[key] || { Z03: [], Z05: [], Z06: [] };
  res.json(data);
};
