import { Router } from 'express';
import { createManifest, transmitManifest, getManifests } from '../controllers/manifest.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();

router.post('/', authenticate, requireRole(['ADMIN', 'CUSTOMS']), auditLog('CREATE', 'Manifest'), createManifest);
router.post('/:manifestId/transmit', authenticate, requireRole(['ADMIN', 'CUSTOMS']), auditLog('TRANSMIT', 'Manifest'), transmitManifest);
router.get('/', authenticate, requireRole(['ADMIN', 'CUSTOMS', 'OPERATOR']), auditLog('READ_LIST', 'Manifest'), getManifests);

export default router;