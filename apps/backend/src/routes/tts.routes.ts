import { Router } from 'express';
import { generateAudioHandler } from '../controllers/tts.controller';

const router = Router();

router.post('/generate-audio', generateAudioHandler);

export default router;
