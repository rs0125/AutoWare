import { Router } from 'express';
import { getPresignedUploadUrlHandler, getBatchPresignedUploadUrlsHandler } from '../controllers/r2.controller';

const router = Router();

router.post('/presigned-url', getPresignedUploadUrlHandler);
router.post('/presigned-urls/batch', getBatchPresignedUploadUrlsHandler);

export default router;
