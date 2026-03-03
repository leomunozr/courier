import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import shipmentRoutes from './routes/shipment.routes';
import auditRoutes from './routes/audit.routes';
import manifestRoutes from './routes/manifest.routes';
import documentRoutes from './routes/document.routes';
import { initializeMinio } from './config/minio';
import { connectRedis } from './config/redis';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/manifests', manifestRoutes);
app.use('/api/documents', documentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await initializeMinio();
  await connectRedis();
});