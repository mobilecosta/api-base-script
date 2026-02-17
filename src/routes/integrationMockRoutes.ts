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

router.get('/dictionary/browse/columns/:alias', getBrowseColumns);
router.get('/dictionary/browse/items/:alias', getBrowseItems);
router.get('/dictionary/struct/:alias', getStructAlias);
router.get('/dictionary/data/:alias/:item', getDictionaryData);
router.get('/dictionary/initializer/:alias', getDictionaryInitializer);
router.post('/dictionary/trigger/:campo', executeTrigger);
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
