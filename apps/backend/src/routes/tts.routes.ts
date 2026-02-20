import { Router } from 'express';
import { generateAudioHandler, generateAudioHandlerSarvam } from '../controllers/tts.controller';

const router = Router();

// OpenAI TTS endpoint
router.post('/generate-audio', generateAudioHandler);

// Sarvam AI Bulbul V3 TTS endpoint
router.post('/generate-audio-sarvam', generateAudioHandlerSarvam);

export default router;
