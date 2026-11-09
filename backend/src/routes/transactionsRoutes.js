import { Router } from 'express';
import {
  simulatePayment,
  getTransactionByToken
} from '../controllers/transactionsController.js';

const router = Router();

router.post('/simulate', simulatePayment);
router.get('/:token', getTransactionByToken);

export default router;
