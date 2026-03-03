import { Router } from 'express';
import { createShipment, addEvent, trackShipment, getShipments } from '../controllers/shipment.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();

router.post('/', authenticate, requireRole(['ADMIN', 'OPERATOR']), auditLog('CREATE', 'Shipment'), createShipment);
router.post('/:shipmentId/events', authenticate, requireRole(['ADMIN', 'OPERATOR']), auditLog('CREATE_EVENT', 'Shipment'), addEvent);
router.get('/', authenticate, requireRole(['ADMIN', 'OPERATOR']), auditLog('READ_LIST', 'Shipment'), getShipments);
router.get('/track/:trackingNumber', trackShipment); // Public endpoint

export default router;