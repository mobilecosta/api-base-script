import request from 'supertest';
import app from '../index';

describe('Integration Mock Routes (/api/isp)', () => {
  it('should return dictionary columns for alias', async () => {
    const res = await request(app).get('/api/isp/dictionary/browse/columns/Z10');
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Plataformas');
    expect(Array.isArray(res.body.struct)).toBe(true);
  });

  it('should return paginated browse items', async () => {
    const res = await request(app).get('/api/isp/dictionary/browse/items/Z10?page=1&pageSize=1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(1);
    expect(typeof res.body.hasNext).toBe('boolean');
  });

  it('should return dictionary data for positioned item payload', async () => {
    const raw = encodeURIComponent(JSON.stringify({ item: { Z10_COD: 'PLAT001' } }));
    const res = await request(app).get(`/api/isp/dictionary/data/Z10/${raw}`);
    expect(res.status).toBe(200);
    expect(res.body.Z10_COD).toBe('PLAT001');
  });

  it('should return initializer for alias', async () => {
    const res = await request(app).get('/api/isp/dictionary/initializer/Z11');
    expect(res.status).toBe(200);
    expect(res.body.Z11_COD).toBeDefined();
    expect(res.body.Z11_DESC).toBeDefined();
  });

  it('should echo payload in trigger endpoint', async () => {
    const payload = { FORMZ10: { Z10_COD: 'AAA', Z10_DESC: 'Teste' } };
    const res = await request(app).post('/api/isp/dictionary/trigger/Z10_DESC').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.Z10_COD).toBe('AAA');
  });

  it('should return lookup entries', async () => {
    const res = await request(app).get('/api/isp/lookup/SA1?filter=000001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should return lookup by id', async () => {
    const res = await request(app).get('/api/isp/lookup/SA1/000001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].a1_cod).toBe('000001');
  });

  it('should execute platforms CRUD flow', async () => {
    const code = `PLATTEST${Date.now()}`;

    const created = await request(app).post('/api/isp/platforms').send({
      Z10_COD: code,
      Z10_DESC: 'Plataforma Teste',
      Z10_ATIVO: 'S'
    });
    expect(created.status).toBe(201);
    expect(created.body.Z10_COD).toBe(code);

    const updated = await request(app).put(`/api/isp/platforms/${code}`).send({
      Z10_DESC: 'Plataforma Atualizada'
    });
    expect(updated.status).toBe(200);
    expect(updated.body.Z10_DESC).toBe('Plataforma Atualizada');

    const deleted = await request(app).delete(`/api/isp/platforms/${code}`);
    expect(deleted.status).toBe(204);
  });

  it('should execute shipping program CRUD flow', async () => {
    const code = `ENVTEST${Date.now()}`;

    const created = await request(app).post('/api/isp/shipping/program').send({
      Z11_COD: code,
      Z11_DESC: 'Envio Teste',
      Z11_PRAZO: 3,
      Z11_ATIVO: 'S'
    });
    expect(created.status).toBe(201);

    const updated = await request(app).put(`/api/isp/shipping/program/${code}`).send({
      Z11_DESC: 'Envio Atualizado'
    });
    expect(updated.status).toBe(200);
    expect(updated.body.Z11_DESC).toBe('Envio Atualizado');

    const deleted = await request(app).delete(`/api/isp/shipping/program/${code}`);
    expect(deleted.status).toBe(204);
  });

  it('should execute marketplaces accounts CRUD flow', async () => {
    const code = `ACCTEST${Date.now()}`;

    const created = await request(app).post('/api/isp/marketplaces/accounts').send({
      Z00_COD: code,
      Z00_DESC: 'Conta Teste',
      Z00_TOKEN: 'token-test',
      Z00_STATUS: 'A'
    });
    expect(created.status).toBe(201);

    const updated = await request(app).put(`/api/isp/marketplaces/accounts/${code}`).send({
      Z00_DESC: 'Conta Atualizada'
    });
    expect(updated.status).toBe(200);
    expect(updated.body.Z00_DESC).toBe('Conta Atualizada');

    const deleted = await request(app).delete(`/api/isp/marketplaces/accounts/${code}`);
    expect(deleted.status).toBe(204);
  });

  it('should execute product x accounts flow', async () => {
    const productCode = `PRD-${Date.now()}`;

    const created = await request(app).post('/api/isp/productxaccounts').send({
      Z01_PRDERP: productCode,
      Z01_DESCER: 'Produto Teste',
      ITENS: [
        { Z01_CONTA: 'ACC001', Z01_SKU: 'SKU-T-1', Z01_ATIVO: 'S' },
        { Z01_CONTA: 'ACC002', Z01_SKU: 'SKU-T-2', Z01_ATIVO: 'S' }
      ]
    });
    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);

    const fetched = await request(app).get(`/api/isp/productxaccounts/${productCode}`);
    expect(fetched.status).toBe(200);
    expect(Array.isArray(fetched.body.items)).toBe(true);
    expect(fetched.body.items.length).toBe(2);

    const deleted = await request(app).delete(`/api/isp/productxaccounts/${productCode}`);
    expect(deleted.status).toBe(204);
  });

  it('should return integrated orders details', async () => {
    const res = await request(app).get('/api/isp/integratedorders/PED-1001/I1001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.Z03)).toBe(true);
    expect(Array.isArray(res.body.Z05)).toBe(true);
    expect(Array.isArray(res.body.Z06)).toBe(true);
  });

  it('should expose the same routes under /app-root/api/isp', async () => {
    const res = await request(app).get('/app-root/api/isp/dictionary/browse/columns/Z10');
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Plataformas');
  });
});
