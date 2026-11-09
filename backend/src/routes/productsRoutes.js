import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getCategories
} from '../controllers/productsController.js';

const router = Router();

router.get('/', listProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/restore', restoreProduct);

export default router;
