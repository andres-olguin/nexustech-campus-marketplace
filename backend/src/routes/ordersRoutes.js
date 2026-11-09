import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrderByCode,
  updateOrderStatus
} from '../controllers/ordersController.js';

const router = Router();

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:codigo', getOrderByCode);
router.patch('/:codigo/status', updateOrderStatus);

export default router;
