import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createManifest = async (req: AuthRequest, res: Response) => {
  try {
    const { shipmentIds } = req.body;

    if (!shipmentIds || !shipmentIds.length) {
      return res.status(400).json({ error: 'Shipment IDs required' });
    }

    const manifestNumber = `MNF${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

    const manifest = await prisma.manifest.create({
      data: {
        manifestNumber,
        status: 'DRAFT',
        shipments: {
          create: shipmentIds.map((id: string) => ({ shipment: { connect: { id } } }))
        }
      },
      include: {
        shipments: true
      }
    });

    res.status(201).json(manifest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create manifest' });
  }
};

export const transmitManifest = async (req: AuthRequest, res: Response) => {
  try {
    const manifestId = req.params.manifestId as string;

    const manifest = await prisma.manifest.findUnique({
      where: { id: manifestId as string },
      include: { shipments: { include: { shipment: true } } }
    });

    if (!manifest) {
      return res.status(404).json({ error: 'Manifest not found' });
    }

    // Mock XML Generation
    const xmlPayload = `<Manifest><ManifestNumber>${manifest.manifestNumber}</ManifestNumber><ShipmentsCount>${manifest.shipments.length}</ShipmentsCount></Manifest>`;

    // Mock Digital Signature (Simulating SAT/Customs signature process)
    const signedXml = `<SignedManifest>${xmlPayload}<Signature>MOCK_SIGNATURE_DATA_AABBCC112233</Signature></SignedManifest>`;

    // Mock Customs Web Service Response (Acuse)
    const responseXml = `<CustomsResponse><Status>ACCEPTED</Status><AcuseId>ACUSE-${Date.now()}</AcuseId></CustomsResponse>`;
    const customsResponseStr = JSON.stringify({ status: 'ACCEPTED', acuseId: `ACUSE-${Date.now()}` });

    await prisma.customsTransmission.create({
      data: {
        manifestId: manifestId as string,
        xmlPayload,
        signedXml,
        responseXml,
        status: 'ACCEPTED'
      }
    });

    const updatedManifest = await prisma.manifest.update({
      where: { id: manifestId as string },
      data: {
        status: 'TRANSMITTED',
        transmittedAt: new Date(),
        customsResponse: customsResponseStr
      }
    });

    // Update shipments to status 'CUSTOMS_CLEARED' (simplified logic for demo)
    for (const sh of manifest.shipments) {
      await prisma.shipment.update({
        where: { id: sh.shipmentId },
        data: { status: 'CUSTOMS_CLEARED' }
      });
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: sh.shipmentId,
          eventType: 'CUSTOMS_CLEARED',
          metadata: JSON.stringify({ manifestId: updatedManifest.id, user: req.user.id })
        }
      });
    }

    res.json(updatedManifest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to transmit manifest' });
  }
};

export const getManifests = async (req: AuthRequest, res: Response) => {
  try {
    const manifests = await prisma.manifest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: { shipments: true }
        }
      }
    });

    res.json(manifests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve manifests' });
  }
};