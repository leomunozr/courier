import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { uploadDocument, getDocumentUrl } from '../config/minio';
import crypto from 'crypto';

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const shipmentId = req.params.shipmentId as string;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId as string } });
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Generate SHA-256 Hash
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Generate unique S3 Key
    const ext = file.originalname.split('.').pop();
    const s3Key = `${shipmentId}/${crypto.randomUUID()}.${ext}`;

    // Upload to MinIO
    await uploadDocument(s3Key, file.buffer);

    // Save to DB
    const document = await prisma.document.create({
      data: {
        shipmentId: shipmentId as string,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        hashSha256: hash,
        s3Key
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const listDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const shipmentId = req.params.shipmentId as string;
    const documents = await prisma.document.findMany({ where: { shipmentId: shipmentId as string } });

    const docsWithUrls = await Promise.all(documents.map(async (doc) => {
      const url = await getDocumentUrl(doc.s3Key);
      return { ...doc, url };
    }));

    res.json(docsWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
};