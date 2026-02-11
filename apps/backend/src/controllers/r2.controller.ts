import { Request, Response } from 'express';
import { generatePresignedUploadUrl, generateBatchPresignedUrls } from '../services/r2.service';
import { z } from 'zod';

const PresignedUrlRequestSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  compositionId: z.string().uuid(),
  mediaType: z.enum(['video', 'audio', 'image']),
});

const BatchPresignedUrlRequestSchema = z.object({
  compositionId: z.string().uuid(),
  files: z.array(
    z.object({
      fileName: z.string(),
      fileType: z.string(),
      mediaType: z.enum(['video', 'audio', 'image']),
      fieldPath: z.string(),
    })
  ),
});

export const getPresignedUploadUrlHandler = async (req: Request, res: Response) => {
  try {
    const validationResult = PresignedUrlRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const result = await generatePresignedUploadUrl(validationResult.data);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBatchPresignedUploadUrlsHandler = async (req: Request, res: Response) => {
  try {
    const validationResult = BatchPresignedUrlRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const results = await generateBatchPresignedUrls(validationResult.data);
    res.status(200).json({ uploads: results });
  } catch (error) {
    console.error('Error generating batch presigned URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
