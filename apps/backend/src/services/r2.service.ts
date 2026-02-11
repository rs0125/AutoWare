import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  compositionId: string;
  mediaType: 'video' | 'audio' | 'image';
}

export const generatePresignedUploadUrl = async (request: PresignedUrlRequest) => {
  const { fileName, fileType, compositionId, mediaType } = request;

  // Generate unique key with timestamp and random string
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = fileName.split('.').pop();
  const key = `compositions/${compositionId}/${mediaType}/${timestamp}-${randomString}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  // Generate presigned URL valid for 1 hour
  const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

  // Public URL for accessing the file after upload
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return {
    uploadUrl: presignedUrl,
    publicUrl,
    key,
    expiresIn: 3600,
  };
};

export interface BatchPresignedUrlRequest {
  compositionId: string;
  files: Array<{
    fileName: string;
    fileType: string;
    mediaType: 'video' | 'audio' | 'image';
    fieldPath: string; // e.g., "satDroneSection.droneVideoUrl"
  }>;
}

export const generateBatchPresignedUrls = async (request: BatchPresignedUrlRequest) => {
  const { compositionId, files } = request;

  const results = await Promise.all(
    files.map(async (file) => {
      const urlData = await generatePresignedUploadUrl({
        fileName: file.fileName,
        fileType: file.fileType,
        compositionId,
        mediaType: file.mediaType,
      });

      return {
        fieldPath: file.fieldPath,
        ...urlData,
      };
    })
  );

  return results;
};
