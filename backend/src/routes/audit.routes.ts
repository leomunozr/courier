import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, requireRole(['ADMIN', 'AUDITOR']), getAuditLogs);

export default router;