import OpenAI from 'openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
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
}

export interface TTSResult {
  fieldPath: string;
  audioUrl: string;
  key: string;
  durationInSeconds: number;
}

export const generateAudioFromText = async (
  compositionId: string,
  requests: TTSRequest[]
): Promise<TTSResult[]> => {
  const results: TTSResult[] = [];

  for (const request of requests) {
    const { text, fieldPath, voice = 'alloy' } = request;

    // Generate audio using OpenAI TTS
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      response_format: 'mp3',
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

    // Estimate duration (rough estimate: ~150 words per minute, ~5 chars per word)
    const estimatedWords = text.length / 5;
    const durationInSeconds = Math.ceil((estimatedWords / 150) * 60);

    results.push({
      fieldPath,
      audioUrl,
      key,
      durationInSeconds,
    });
  }

  return results;
};
