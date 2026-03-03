import { Router } from 'express';
import multer from 'multer';
import { uploadFile, listDocuments } from '../controllers/document.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/:shipmentId', authenticate, requireRole(['ADMIN', 'OPERATOR']), upload.single('document'), auditLog('UPLOAD_DOC', 'Document'), uploadFile);
router.get('/:shipmentId', authenticate, requireRole(['ADMIN', 'OPERATOR', 'AUDITOR']), auditLog('READ_DOCS', 'Document'), listDocuments);

export default router;