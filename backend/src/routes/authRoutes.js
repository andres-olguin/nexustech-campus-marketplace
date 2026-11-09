import { Router } from 'express';
import { register, login, getProfile, switchRole, listSellers } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getProfile);
router.post('/switch-role', switchRole);
router.get('/sellers', listSellers);

export default router;
