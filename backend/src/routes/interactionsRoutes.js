import { Router } from 'express';
import {
  logInteraction,
  getInteractionHistory,
  getAnalytics
} from '../controllers/interactionsController.js';

const router = Router();

router.post('/', logInteraction);
router.get('/', getInteractionHistory);
router.get('/analytics', getAnalytics);

export default router;
