import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateTrackingNumber } from '../utils/tracking';
import { redisClient } from '../config/redis';

export const createShipment = async (req: AuthRequest, res: Response) => {
  try {
    const { senderData, receiverData, value, weight } = req.body;
    const trackingNumber = generateTrackingNumber();

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        senderData: JSON.stringify(senderData),
        receiverData: JSON.stringify(receiverData),
        value,
        weight,
        status: 'CREATED'
      }
    });

    await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        eventType: 'CREATED',
        metadata: JSON.stringify({ userId: req.user.id })
      }
    });

    res.status(201).json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
};

export const addEvent = async (req: AuthRequest, res: Response) => {
  try {
    const shipmentId = req.params.shipmentId as string;
    const { eventType, location, metadata } = req.body;

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const event = await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipmentId as string,
        eventType,
        location,
        metadata: JSON.stringify({ ...metadata, userId: req.user.id })
      }
    });

    // Update status based on latest event
    const updated = await prisma.shipment.update({
      where: { id: shipmentId as string },
      data: { status: eventType }
    });

    // Invalidate Cache
    if (redisClient.isOpen) {
      await redisClient.del(`tracking:${updated.trackingNumber}`);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add event' });
  }
};

export const trackShipment = async (req: AuthRequest, res: Response) => {
  try {
    const trackingNumber = req.params.trackingNumber as string;

    // Check Cache
    const cacheKey = `tracking:${trackingNumber}`;
    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached as string));
      }
    }

    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        events: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Set Cache for 1 minute
    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(shipment));
    }

    res.json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to track shipment' });
  }
};

export const getShipments = async (req: AuthRequest, res: Response) => {
  try {
    const shipments = await prisma.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(shipments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve shipments' });
  }
};