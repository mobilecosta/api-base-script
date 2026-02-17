import { Router } from 'express';
import {
  deleteMarketplacesAccounts,
  deletePlatforms,
  deleteProductXAccounts,
  deleteShippingProgram,
  executeTrigger,
  getBrowseColumns,
  getBrowseItems,
  getDictionaryData,
  getDictionaryInitializer,
  getIntegratedOrders,
  getLookup,
  getLookupById,
  getProductXAccountsById,
  getStructAlias,
  postMarketplacesAccounts,
  postPlatforms,
  postProductXAccounts,
  postShippingProgram,
  putMarketplacesAccounts,
  putPlatforms,
  putShippingProgram,
  syncDictionarySchemas
} from '../controllers/integrationMockController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Integration Dictionary
 *     description: Endpoints de dicionário dinâmico para aliases
 *   - name: Integration CRUD
 *     description: Endpoints de manutenção e consultas de integração
 */

/**
 * @swagger
 * /api/dictionary/browse/columns/{alias}:
 *   get:
 *     summary: Retorna schema completo do alias (columns/struct/folders/agrups)
 *     tags: [Integration Dictionary]
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *         description: Alias da tabela (ex Z00, Z10)
 *     responses:
 *       200:
 *         description: Schema encontrado
 *       404:
 *         description: Alias nao encontrado
 */
router.get('/dictionary/browse/columns/:alias', getBrowseColumns);

/**
 * @swagger
 * /api/dictionary/browse/items/{alias}:
 *   get:
 *     summary: Retorna itens paginados da tabela vinculada ao alias
 *     tags: [Integration Dictionary]
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *       - in: query
 *         name: $order
 *         schema:
 *           type: string
 *         description: Exemplo Z10_DESC DESC
 *     responses:
 *       200:
 *         description: Lista paginada
 */
router.get('/dictionary/browse/items/:alias', getBrowseItems);

/**
 * @swagger
 * /api/dictionary/struct/{alias}:
 *   get:
 *     summary: Retorna estrutura do alias no formato AliasSchema
 *     tags: [Integration Dictionary]
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estrutura encontrada
 *       404:
 *         description: Alias nao encontrado
 */
router.get('/dictionary/struct/:alias', getStructAlias);

/**
 * @swagger
 * /api/dictionary/data/{alias}/{item}:
 *   get:
 *     summary: Retorna item de dicionario por payload serializado na URL
 *     tags: [Integration Dictionary]
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: item
 *         required: true
 *         schema:
 *           type: string
 *         description: JSON url-encoded com item posicionado
 *     responses:
 *       200:
 *         description: Item encontrado ou fallback
 */
router.get('/dictionary/data/:alias/:item', getDictionaryData);

/**
 * @swagger
 * /api/dictionary/initializer/{alias}:
 *   get:
 *     summary: Retorna objeto inicial padrao com base no schema do alias
 *     tags: [Integration Dictionary]
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inicializador retornado
 *       404:
 *         description: Alias nao encontrado
 */
router.get('/dictionary/initializer/:alias', getDictionaryInitializer);

/**
 * @swagger
 * /api/dictionary/trigger/{campo}:
 *   post:
 *     summary: Executa trigger mock e devolve payload normalizado
 *     tags: [Integration Dictionary]
 *     parameters:
 *       - in: path
 *         name: campo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Payload processado
 */
router.post('/dictionary/trigger/:campo', executeTrigger);

/**
 * @swagger
 * /api/dictionary/sync:
 *   post:
 *     summary: Sincroniza schemas de dicionario no Supabase (tables/table_fields/table_folders/table_agrups)
 *     tags: [Integration Dictionary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               useSeed:
 *                 type: boolean
 *                 description: Quando true sincroniza aliases padrao internos
 *               aliasSchemas:
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     struct:
 *                       type: array
 *                       items:
 *                         type: object
 *                     folders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     agrups:
 *                       type: array
 *                       items:
 *                         type: object
 *               schemas:
 *                 type: array
 *                 description: Formato alternativo de entrada
 *                 items:
 *                   type: object
 *                   properties:
 *                     alias:
 *                       type: string
 *                     description:
 *                       type: string
 *                     struct:
 *                       type: array
 *                       items:
 *                         type: object
 *                     folders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     agrups:
 *                       type: array
 *                       items:
 *                         type: object
 *           examples:
 *             syncWithSeed:
 *               summary: Sincronizar seed interno
 *               value:
 *                 useSeed: true
 *             syncWithPayload:
 *               summary: Sincronizar payload customizado
 *               value:
 *                 aliasSchemas:
 *                   Z99:
 *                     description: Minha Tabela
 *                     struct:
 *                       - field: Z99_COD
 *                         title: Codigo
 *                         type: C
 *                         size: 15
 *                         required: true
 *                         editable: true
 *                         enabled: true
 *                         virtual: false
 *                         options: []
 *                         decimals: 0
 *                         exist_trigger: false
 *                         help: ""
 *                         order: 1
 *                     folders: []
 *                     agrups: []
 *     responses:
 *       200:
 *         description: Sincronizacao concluida
 *       400:
 *         description: Nenhum schema enviado
 *       500:
 *         description: Erro ao sincronizar
 */
router.post('/dictionary/sync', syncDictionarySchemas);

/**
 * @swagger
 * /api/lookup/{ctabela}:
 *   get:
 *     summary: Busca dados de lookup por tabela (SA1, Z02)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: ctabela
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de lookup
 */
router.get('/lookup/:ctabela', getLookup);

/**
 * @swagger
 * /api/lookup/{ctabela}/{id}:
 *   get:
 *     summary: Busca registro de lookup por ID
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: ctabela
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lookup encontrado ou lista vazia
 */
router.get('/lookup/:ctabela/:id', getLookupById);

/**
 * @swagger
 * /api/platforms:
 *   post:
 *     summary: Cria plataforma (legado Z10)
 *     tags: [Integration CRUD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Registro criado
 */
router.post('/platforms', postPlatforms);

/**
 * @swagger
 * /api/platforms/{id}:
 *   put:
 *     summary: Atualiza plataforma (legado Z10)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Registro atualizado
 *       404:
 *         description: Registro não encontrado
 */
router.put('/platforms/:id', putPlatforms);

/**
 * @swagger
 * /api/platforms/{id}:
 *   delete:
 *     summary: Remove plataforma (legado Z10)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Registro removido
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/platforms/:id', deletePlatforms);

/**
 * @swagger
 * /api/shipping/program:
 *   post:
 *     summary: Cria programa de envio (Z11)
 *     tags: [Integration CRUD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Registro criado
 */
router.post('/shipping/program', postShippingProgram);

/**
 * @swagger
 * /api/shipping/program/{id}:
 *   put:
 *     summary: Atualiza programa de envio (Z11)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Registro atualizado
 *       404:
 *         description: Registro não encontrado
 */
router.put('/shipping/program/:id', putShippingProgram);

/**
 * @swagger
 * /api/shipping/program/{id}:
 *   delete:
 *     summary: Remove programa de envio (Z11)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Registro removido
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/shipping/program/:id', deleteShippingProgram);

/**
 * @swagger
 * /api/marketplaces/accounts:
 *   post:
 *     summary: Cria conta de marketplace (Z00)
 *     tags: [Integration CRUD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Registro criado
 */
router.post('/marketplaces/accounts', postMarketplacesAccounts);

/**
 * @swagger
 * /api/marketplaces/accounts/{id}:
 *   put:
 *     summary: Atualiza conta de marketplace (Z00)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Registro atualizado
 *       404:
 *         description: Registro não encontrado
 */
router.put('/marketplaces/accounts/:id', putMarketplacesAccounts);

/**
 * @swagger
 * /api/marketplaces/accounts/{id}:
 *   delete:
 *     summary: Remove conta de marketplace (Z00)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Registro removido
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/marketplaces/accounts/:id', deleteMarketplacesAccounts);

/**
 * @swagger
 * /api/productxaccounts:
 *   post:
 *     summary: Cria vínculo produto x conta (Z01)
 *     tags: [Integration CRUD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Registro criado
 */
router.post('/productxaccounts', postProductXAccounts);

/**
 * @swagger
 * /api/productxaccounts/{id}:
 *   get:
 *     summary: Busca vínculos por produto ERP (Z01_PRDERP)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de vínculos
 */
router.get('/productxaccounts/:id', getProductXAccountsById);

/**
 * @swagger
 * /api/productxaccounts/{id}:
 *   delete:
 *     summary: Remove vínculos por produto ERP (Z01_PRDERP)
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Registro removido
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/productxaccounts/:id', deleteProductXAccounts);

/**
 * @swagger
 * /api/integratedorders/{idPed}/{idInt}:
 *   get:
 *     summary: Retorna itens, pagamentos e faturamentos do pedido integrado
 *     tags: [Integration CRUD]
 *     parameters:
 *       - in: path
 *         name: idPed
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idInt
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do pedido integrado
 */
router.get('/integratedorders/:idPed/:idInt', getIntegratedOrders);

export default router;
