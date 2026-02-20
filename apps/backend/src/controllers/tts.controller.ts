import { Request, Response } from 'express';
import { generateAudioFromText } from '../services/tts.service';
import { generateAudioFromTextSarvam } from '../services/sarvam-tts.service';
import { updateMediaUrls } from '../services/composition.service';
import { z } from 'zod';

const TTSRequestSchema = z.object({
  compositionId: z.string().uuid(),
  transcripts: z.array(
    z.object({
      text: z.string().min(1),
      fieldPath: z.string(),
      voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
      speed: z.number().min(0.25).max(4.0).optional(),
    })
  ),
  updateComposition: z.boolean().optional().default(true),
});

const SarvamTTSRequestSchema = z.object({
  compositionId: z.string().uuid(),
  transcripts: z.array(
    z.object({
      text: z.string().min(1),
      fieldPath: z.string(),
      voice: z.string().optional(), // Sarvam voice names like 'meera', 'arvind', 'rohan'
      language: z.string().optional(), // Language codes like 'en-IN', 'hi-IN'
      speed: z.number().min(0.5).max(2.0).optional(), // Pace parameter
      sampleRate: z.number().optional(), // 8000, 16000, 22050, 24000, 48000
    })
  ),
  updateComposition: z.boolean().optional().default(true),
});

export const generateAudioHandler = async (req: Request, res: Response) => {
  try {
    const validationResult = TTSRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { compositionId, transcripts, updateComposition } = validationResult.data;

    // Generate audio files
    const results = await generateAudioFromText(compositionId, transcripts);

    // Optionally update composition with audio URLs
    if (updateComposition) {
      const urlMappings: Record<string, any> = {};

      results.forEach((result, index) => {
        // The fieldPath from the request is the transcript path (e.g., "satDroneSection.audio.transcript")
        // We need to update audioUrl, durationInSeconds, AND transcript
        const pathParts = result.fieldPath.split('.');
        const basePath = pathParts.slice(0, -1).join('.'); // Remove "transcript" to get "satDroneSection.audio"
        
        const audioUrlPath = `${basePath}.audioUrl`;
        const durationPath = `${basePath}.durationInSeconds`;
        const transcriptPath = result.fieldPath; // Keep the full path for transcript
        
        urlMappings[audioUrlPath] = result.audioUrl;
        urlMappings[durationPath] = result.durationInSeconds;
        urlMappings[transcriptPath] = transcripts[index].text; // Save the transcript text!
      });

      await updateMediaUrls(compositionId, urlMappings);
    }

    res.status(200).json({
      success: true,
      audioFiles: results,
      compositionUpdated: updateComposition,
    });
  } catch (error: any) {
    console.error('Error generating audio:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Composition not found' });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

export const generateAudioHandlerSarvam = async (req: Request, res: Response) => {
  try {
    const validationResult = SarvamTTSRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { compositionId, transcripts, updateComposition } = validationResult.data;

    // Generate audio files using Sarvam AI
    const results = await generateAudioFromTextSarvam(compositionId, transcripts);

    // Optionally update composition with audio URLs
    if (updateComposition) {
      const urlMappings: Record<string, any> = {};

      results.forEach((result, index) => {
        // The fieldPath from the request is the transcript path (e.g., "satDroneSection.audio.transcript")
        // We need to update audioUrl, durationInSeconds, AND transcript
        const pathParts = result.fieldPath.split('.');
        const basePath = pathParts.slice(0, -1).join('.'); // Remove "transcript" to get "satDroneSection.audio"
        
        const audioUrlPath = `${basePath}.audioUrl`;
        const durationPath = `${basePath}.durationInSeconds`;
        const transcriptPath = result.fieldPath; // Keep the full path for transcript
        
        urlMappings[audioUrlPath] = result.audioUrl;
        urlMappings[durationPath] = result.durationInSeconds;
        urlMappings[transcriptPath] = transcripts[index].text; // Save the transcript text!
      });

      await updateMediaUrls(compositionId, urlMappings);
    }

    res.status(200).json({
      success: true,
      audioFiles: results,
      compositionUpdated: updateComposition,
    });
  } catch (error: any) {
    console.error('Error generating audio with Sarvam AI:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Composition not found' });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
