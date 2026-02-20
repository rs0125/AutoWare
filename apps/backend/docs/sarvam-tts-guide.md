# Sarvam AI Bulbul V3 TTS Integration

This guide explains how to use the Sarvam AI Bulbul V3 text-to-speech endpoint.

## Endpoint

```
POST /api/tts/generate-audio-sarvam
```

## Configuration

Add your Sarvam AI API key to `.env`:

```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

Install the Sarvam AI SDK:

```bash
npm install sarvamai
```

## Request Body

```json
{
  "compositionId": "uuid-of-composition",
  "transcripts": [
    {
      "text": "Welcome to our warehouse facility",
      "fieldPath": "satDroneSection.audio.transcript",
      "voice": "meera",
      "language": "en-IN",
      "speed": 1.0
    }
  ],
  "updateComposition": true
}
```

### Parameters

- `compositionId` (required): UUID of the video composition
- `transcripts` (required): Array of transcript objects
  - `text` (required): The text to convert to speech
  - `fieldPath` (required): Path where the audio should be stored (e.g., "satDroneSection.audio.transcript")
  - `voice` (optional): Sarvam AI voice name. Default: "rohan"
  - `language` (optional): Language code. Default: "en-IN"
  - `speed` (optional): Speech pace (0.5 to 2.0). Default: 1.0
  - `sampleRate` (optional): Audio sample rate (8000, 16000, 22050, 24000, 48000). Default: 22050
- `updateComposition` (optional): Whether to update the composition with generated audio URLs. Default: true

### Available Voices

Sarvam AI Bulbul V3 supports 46 Indian voices:

**Female voices**: anushka, manisha, vidya, arya, ritu, priya, neha, pooja, simran, kavya, ishita, shreya, roopa, tanya, shruti, suhani, kavitha, rupali

**Male voices**: rohan (default), abhilash, karun, hitesh, aditya, rahul, amit, dev, ratan, varun, manan, sumit, kabir, aayan, shubh, ashutosh, advait, anand, tarun, sunny, mani, gokul, vijay, mohit, rehan, soham

**Other**: amelia, sophia

### Supported Languages

- `en-IN` - Indian English (default)
- `hi-IN` - Hindi
- `ta-IN` - Tamil
- `te-IN` - Telugu
- `kn-IN` - Kannada
- `ml-IN` - Malayalam
- `mr-IN` - Marathi
- `gu-IN` - Gujarati
- `bn-IN` - Bengali
- `pa-IN` - Punjabi

## Response

```json
{
  "success": true,
  "audioFiles": [
    {
      "fieldPath": "satDroneSection.audio.transcript",
      "audioUrl": "https://your-r2-url.com/compositions/uuid/audio/timestamp-hash.mp3",
      "key": "compositions/uuid/audio/timestamp-hash.mp3",
      "durationInSeconds": 5
    }
  ],
  "compositionUpdated": true
}
```

## Example Usage

### cURL

```bash
curl -X POST http://localhost:3000/api/tts/generate-audio-sarvam \
  -H "Content-Type: application/json" \
  -d '{
    "compositionId": "ecfb21c1-3422-4875-bc41-ce6ff33f9bb1",
    "transcripts": [
      {
        "text": "Welcome to our state-of-the-art warehouse facility",
        "fieldPath": "satDroneSection.audio.transcript",
        "voice": "rohan",
        "language": "en-IN",
        "speed": 1.0,
        "sampleRate": 48000
      }
    ],
    "updateComposition": true
  }'
```

### JavaScript/TypeScript

```typescript
const response = await fetch('/api/tts/generate-audio-sarvam', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    compositionId: 'ecfb21c1-3422-4875-bc41-ce6ff33f9bb1',
    transcripts: [
      {
        text: 'Welcome to our state-of-the-art warehouse facility',
        fieldPath: 'satDroneSection.audio.transcript',
        voice: 'rohan',
        language: 'en-IN',
        speed: 1.0,
        sampleRate: 48000,
      },
    ],
    updateComposition: true,
  }),
});

const data = await response.json();
console.log(data.audioFiles);
```

## Comparison with OpenAI TTS

| Feature | OpenAI TTS | Sarvam AI Bulbul V3 |
|---------|-----------|---------------------|
| Endpoint | `/api/tts/generate-audio` | `/api/tts/generate-audio-sarvam` |
| Voices | 6 English voices | Multiple Indian voices |
| Languages | English only | 10+ Indian languages |
| Speed Range | 0.25 - 4.0 | 0.5 - 2.0 |
| Quality | HD quality | High quality |
| Best For | English narration | Indian language narration |

## Error Handling

The endpoint returns appropriate HTTP status codes:

- `200` - Success
- `400` - Validation error (invalid request body)
- `404` - Composition not found
- `500` - Server error (API error, upload failure, etc.)

Example error response:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["transcripts", 0, "text"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

## Notes

- Audio files are automatically uploaded to Cloudflare R2
- Duration is estimated based on word count and speech speed
- Text is automatically enhanced for better narration quality
- The same response format is used as the OpenAI endpoint for easy switching
