import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin_minio',
  secretKey: process.env.MINIO_SECRET_KEY || 'password_minio123',
});

const BUCKET_NAME = 'courier-docs';

export const initializeMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket ${BUCKET_NAME} created successfully.`);
    } else {
      console.log(`Bucket ${BUCKET_NAME} already exists.`);
    }
  } catch (error) {
    console.error('Error initializing MinIO:', error);
  }
};

export const uploadDocument = async (fileName: string, fileBuffer: Buffer) => {
  try {
    await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer);
    return fileName;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    throw error;
  }
};

export const getDocumentUrl = async (fileName: string) => {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, fileName, 24 * 60 * 60); // 24 hours valid
  } catch (error) {
    console.error('Error getting MinIO URL:', error);
    throw error;
  }
};