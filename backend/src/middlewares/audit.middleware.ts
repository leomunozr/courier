import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from './auth.middleware';

export const auditLog = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // We capture the original send to intercept the response
    const originalSend = res.json;

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract entity ID if available in params, body, or response
        let entityId = 'UNKNOWN';
        if (req.params.id) entityId = req.params.id as string;
        else if (req.params.shipmentId) entityId = req.params.shipmentId as string;
        else if (body && body.id) entityId = body.id;

        if (req.user && req.user.id) {
          prisma.auditLog.create({
            data: {
              userId: req.user.id,
              action,
              entity,
              entityId,
              metadata: JSON.stringify({
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                body: req.method !== 'GET' ? req.body : undefined
              })
            }
          }).catch(err => console.error('Failed to create audit log:', err));
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};