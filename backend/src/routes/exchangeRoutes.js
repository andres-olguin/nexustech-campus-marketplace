import { Router } from 'express';
import { getUsdRate } from '../controllers/exchangeController.js';

const router = Router();

router.get('/usd', getUsdRate);

export default router;
