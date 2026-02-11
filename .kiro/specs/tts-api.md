# Text-to-Speech API

## Endpoint

**POST /api/tts/generate-audio**

Converts transcript text to audio using OpenAI TTS, uploads to R2, and optionally updates the composition.

## Request Body

```json
{
  "compositionId": "uuid",
  "transcripts": [
    {
      "text": "string (required)",
      "fieldPath": "string (required)",
      "voice": "alloy|echo|fable|onyx|nova|shimmer (optional, default: alloy)"
    }
  ],
  "updateComposition": true|false (optional, default: true)
}
```

### Parameters

- **compositionId** (string, required): UUID of the composition
- **transcripts** (array, required): Array of transcript objects
  - **text** (string, required): The text to convert to speech
  - **fieldPath** (string, required): Where to save the audio URL (e.g., "satDroneSection.audio.audioUrl")
  - **voice** (string, optional): OpenAI TTS voice to use
- **updateComposition** (boolean, optional): Whether to automatically update the composition with audio URLs (default: true)

### Available Voices

- **alloy** - Neutral, balanced voice
- **echo** - Clear, professional voice
- **fable** - Warm, expressive voice
- **onyx** - Deep, authoritative voice
- **nova** - Friendly, energetic voice
- **shimmer** - Soft, gentle voice

## Response

```json
{
  "success": true,
  "audioFiles": [
    {
      "fieldPath": "satDroneSection.audio.audioUrl",
      "audioUrl": "https://pub-xxx.r2.dev/compositions/uuid/audio/timestamp-random.mp3",
      "key": "compositions/uuid/audio/timestamp-random.mp3",
      "durationInSeconds": 8
    }
  ],
  "compositionUpdated": true
}
```

## Examples

### Single Audio Generation

```bash
curl -X POST http://localhost:5000/api/tts/generate-audio \
  -H "Content-Type: application/json" \
  -d '{
    "compositionId": "5491c25a-dc35-4b65-a51f-70faa64bc3e8",
    "transcripts": [
      {
        "text": "Welcome to our state-of-the-art warehouse facility",
        "fieldPath": "satDroneSection.audio.audioUrl",
        "voice": "alloy"
      }
    ]
  }'
```

### Multiple Audio Files

```bash
curl -X POST http://localhost:5000/api/tts/generate-audio \
  -H "Content-Type: application/json" \
  -d '{
    "compositionId": "5491c25a-dc35-4b65-a51f-70faa64bc3e8",
    "transcripts": [
      {
        "text": "Welcome to our warehouse",
        "fieldPath": "satDroneSection.audio.audioUrl",
        "voice": "alloy"
      },
      {
        "text": "Located near major highways",
        "fieldPath": "locationSection.audio.audioUrl",
        "voice": "nova"
      },
      {
        "text": "Modern facilities and amenities",
        "fieldPath": "internalSection.audio.audioUrl",
        "voice": "shimmer"
      }
    ]
  }'
```

### Generate Without Updating Composition

```bash
curl -X POST http://localhost:5000/api/tts/generate-audio \
  -H "Content-Type: application/json" \
  -d '{
    "compositionId": "5491c25a-dc35-4b65-a51f-70faa64bc3e8",
    "transcripts": [
      {
        "text": "Test audio",
        "fieldPath": "satDroneSection.audio.audioUrl"
      }
    ],
    "updateComposition": false
  }'
```

## What It Does

1. **Generates Audio**: Calls OpenAI TTS API to convert text to MP3
2. **Uploads to R2**: Stores audio file in R2 bucket at `compositions/{id}/audio/{timestamp}-{random}.mp3`
3. **Estimates Duration**: Calculates approximate audio duration based on text length
4. **Updates Composition**: Saves audio URL and duration to the composition (if enabled)

## Auto-Update Behavior

When `updateComposition: true` (default), the endpoint automatically updates:
- Audio URL at the specified `fieldPath`
- Duration at `{fieldPath without .audioUrl}.durationInSeconds`

Example:
- If `fieldPath` is `"satDroneSection.audio.audioUrl"`
- It updates `satDroneSection.audio.audioUrl` with the audio URL
- It updates `satDroneSection.audio.durationInSeconds` with the duration

## Error Responses

**400 Bad Request** - Validation error
```json
{
  "error": "Validation failed",
  "details": [...]
}
```

**404 Not Found** - Composition doesn't exist
```json
{
  "error": "Composition not found"
}
```

**500 Internal Server Error** - OpenAI API error or upload failure
```json
{
  "error": "Internal server error",
  "message": "error details"
}
```

## Configuration

Add to `.env`:
```env
OPENAI_API_KEY=sk-...
```

## Use Cases

1. **Bulk Audio Generation**: Generate all audio files for a composition at once
2. **Individual Updates**: Update specific section audio
3. **Voice Variety**: Use different voices for different sections
4. **Preview Mode**: Generate audio without updating composition (`updateComposition: false`)
