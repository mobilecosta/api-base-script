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
 * /api/v1/isp/dictionary/browse/columns/{alias}:
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
 * /api/v1/isp/dictionary/browse/items/{alias}:
 *   get:
 *     summary: Retorna itens mock paginados para o alias informado
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
 * /api/v1/isp/dictionary/struct/{alias}:
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
 * /api/v1/isp/dictionary/data/{alias}/{item}:
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
 * /api/v1/isp/dictionary/initializer/{alias}:
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
 * /api/v1/isp/dictionary/trigger/{campo}:
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
 * /api/v1/isp/dictionary/sync:
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

router.get('/lookup/:ctabela', getLookup);
router.get('/lookup/:ctabela/:id', getLookupById);

router.post('/platforms', postPlatforms);
router.put('/platforms/:id', putPlatforms);
router.delete('/platforms/:id', deletePlatforms);

router.post('/shipping/program', postShippingProgram);
router.put('/shipping/program/:id', putShippingProgram);
router.delete('/shipping/program/:id', deleteShippingProgram);

router.post('/marketplaces/accounts', postMarketplacesAccounts);
router.put('/marketplaces/accounts/:id', putMarketplacesAccounts);
router.delete('/marketplaces/accounts/:id', deleteMarketplacesAccounts);

router.post('/productxaccounts', postProductXAccounts);
router.get('/productxaccounts/:id', getProductXAccountsById);
router.delete('/productxaccounts/:id', deleteProductXAccounts);

router.get('/integratedorders/:idPed/:idInt', getIntegratedOrders);

export default router;
