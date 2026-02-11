import { Request, Response } from 'express';
import { generateAudioFromText } from '../services/tts.service';
import { updateMediaUrls } from '../services/composition.service';
import { z } from 'zod';

const TTSRequestSchema = z.object({
  compositionId: z.string().uuid(),
  transcripts: z.array(
    z.object({
      text: z.string().min(1),
      fieldPath: z.string(),
      voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
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
      const urlMappings: Record<string, string> = {};
      const durationMappings: Record<string, number> = {};

      results.forEach((result) => {
        urlMappings[result.fieldPath] = result.audioUrl;
        // Also update duration if the fieldPath is for audio.audioUrl
        if (result.fieldPath.endsWith('.audioUrl')) {
          const durationPath = result.fieldPath.replace('.audioUrl', '.durationInSeconds');
          durationMappings[durationPath] = result.durationInSeconds;
        }
      });

      // Merge both URL and duration mappings, converting numbers to strings for updateMediaUrls
      const allMappings: Record<string, any> = { ...urlMappings };
      Object.entries(durationMappings).forEach(([key, value]) => {
        allMappings[key] = value;
      });

      await updateMediaUrls(compositionId, allMappings);
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
