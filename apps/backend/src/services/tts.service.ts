import OpenAI from 'openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface TTSRequest {
  text: string;
  fieldPath: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0, default 1.0
}

export interface TTSResult {
  fieldPath: string;
  audioUrl: string;
  key: string;
  durationInSeconds: number;
}

/**
 * Enhances text for professional warehouse showcase narration
 * Adds subtle formatting cues to improve TTS delivery
 */
function enhanceTextForWarehouseNarration(text: string): string {
  // Add slight pauses after key phrases for better pacing
  let enhanced = text;
  
  // Add brief pause after introductory phrases
  enhanced = enhanced.replace(/^(Welcome to|Located at|Featuring|This warehouse)/gi, '$1,');
  
  // Add emphasis on numbers and measurements
  enhanced = enhanced.replace(/(\d+)\s*(meters|kilometers|square feet|sq ft|km|m)/gi, '$1 $2');
  
  // Ensure proper pause after location names
  enhanced = enhanced.replace(/([A-Z][a-z]+\s+[A-Z][a-z]+),/g, '$1.');
  
  // Add slight pause before "with" or "featuring" for better flow
  enhanced = enhanced.replace(/\s+(with|featuring)\s+/gi, ', $1 ');
  
  return enhanced;
}

export const generateAudioFromText = async (
  compositionId: string,
  requests: TTSRequest[]
): Promise<TTSResult[]> => {
  const results: TTSResult[] = [];

  for (const request of requests) {
    const { text, fieldPath, voice = 'onyx', speed = 1.0 } = request;

    // Enhance the text with professional narration instructions
    const enhancedText = enhanceTextForWarehouseNarration(text);

    // Generate audio using OpenAI TTS with HD quality
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice as any,
      input: enhancedText,
      response_format: 'mp3',
      speed: speed,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    // Generate unique key
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const key = `compositions/${compositionId}/audio/${timestamp}-${randomString}.mp3`;

    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: 'audio/mpeg',
      })
    );

    const audioUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    // Calculate more accurate duration estimate
    // OpenAI TTS-1 model speaks at approximately 150-180 words per minute
    // We'll use 165 WPM as a middle ground
    // Average word length is ~5 characters including spaces
    const wordCount = text.split(/\s+/).length;
    const durationInSeconds = Math.max(1, Math.ceil((wordCount / 165) * 60));

    results.push({
      fieldPath,
      audioUrl,
      key,
      durationInSeconds,
    });
  }

  return results;
};
