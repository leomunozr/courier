import { Router } from 'express';
import { login, seedUser } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/seed', seedUser); // For initial setup

export default router;