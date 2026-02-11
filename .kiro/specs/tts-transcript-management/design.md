# Design Document

## Overview

This feature implements an intelligent Text-to-Speech (TTS) system that generates audio from transcript text, tracks changes, manages video section durations dynamically, and ensures proper audio playback timing in the video composition. The backend TTS API (`/api/tts/generate-audio`) and Zod schemas (`AudioMetaSchema`) are already implemented and functional.

## Architecture

### Component Structure

```
TranscriptInput Component
├── Transcript textarea
├── Generate Speech button (conditional)
├── Audio duration display (conditional)
└── Change detection logic

Editor Page
├── TTS generation handler
├── Duration calculation logic
└── Form state management

SchemaFormGenerator
├── Transcript field detection
├── TranscriptInput rendering
└── Props passing (compositionId, handlers)

Video Composition (Remotion)
├── Section components with audio
├── Padding calculation
└── Audio playback timing
```

### Data Flow

1. **User Input** → Transcript text entered/modified
2. **Change Detection** → Compare with original, show button if different
3. **TTS Generation** → API call to OpenAI TTS
4. **Audio Upload** → Upload to R2 storage
5. **Form Update** → Update audioUrl and durationInSeconds
6. **Duration Recalculation** → Update section and total durations
7. **Video Playback** → Play audio with calculated padding

## Components and Interfaces

### TranscriptInput Component

**Purpose:** Specialized textarea component for transcript fields with TTS generation capability

**Props:**
```typescript
interface TranscriptInputProps {
  value?: string;
  onChange: (value: string) => void;
  audioUrl?: string;
  audioDuration?: number;
  onGenerateSpeech?: (transcript: string, fieldPath: string) => Promise<void>;
  fieldPath: string;
  label?: string;
  compositionId?: string;
  disabled?: boolean;
}
```

**State:**
- `originalTranscript`: string - Stored when audio exists
- `hasChanged`: boolean - True if transcript differs from original
- `isGenerating`: boolean - True during TTS generation

**Behavior:**
- Show "Generate Speech" button when: `!audioUrl || hasChanged`
- Display audio duration when: `audioUrl && audioDuration`
- Track changes by comparing current value with `originalTranscript`
- Reset `hasChanged` after successful generation
- Use textarea element (not input) for multi-line transcript text
- Style consistently with existing Input component from `apps/web/app/components/Input.tsx`

### TTS API Integration

**Status:** ✅ Backend API already implemented at `apps/backend/src/controllers/tts.controller.ts`

**Frontend API Function:**
```typescript
// To be added to apps/web/app/lib/api.ts
export const generateAudioFromText = async (
  compositionId: string,
  transcripts: Array<{
    text: string;
    fieldPath: string;
    voice?: string;
  }>
): Promise<{
  success: boolean;
  audioFiles: Array<{
    fieldPath: string;
    audioUrl: string;
    key: string;
    durationInSeconds: number;
  }>;
}>
```

**Backend Endpoint:** `POST /api/tts/generate-audio` (Already implemented)

**Request Body:**
```json
{
  "compositionId": "uuid",
  "transcripts": [
    {
      "text": "Welcome to the warehouse...",
      "fieldPath": "satDroneSection.audio.transcript",
      "voice": "alloy"
    }
  ],
  "updateComposition": true
}
```

**Response:**
```json
{
  "success": true,
  "audioFiles": [
    {
      "fieldPath": "satDroneSection.audio.transcript",
      "audioUrl": "https://r2.../audio.mp3",
      "key": "compositions/.../audio.mp3",
      "durationInSeconds": 12.5
    }
  ],
  "compositionUpdated": true
}
```

**Note:** The backend automatically updates the composition with audio URLs and durations when `updateComposition: true`.

## Data Models

### Audio Object Structure

**Status:** ✅ Already defined in `packages/shared/src/schemata.ts` as `AudioMetaSchema`

```typescript
// From packages/shared/src/schemata.ts
const AudioMetaSchema = z.object({
  audioUrl: MediaUrl.optional(),  // Optional - generated via TTS from transcript
  durationInSeconds: z.number().positive(), // Critical for calculating frame counts
  transcript: z.string(),     // The text script (used for subtitles & the editor UI)
});
```

All video sections (satDroneSection, locationSection, internalSection, dockingSection, complianceSection) already include an `audio` field using this schema.

### Section Duration Calculation

```typescript
interface SectionDuration {
  audioDuration: number;        // From TTS API
  minimumDuration: number;      // audioDuration + 1.0 (0.5s buffer each side)
  actualDuration: number;       // User-set or minimum
  startPadding: number;         // (actualDuration - audioDuration) / 2
  endPadding: number;           // (actualDuration - audioDuration) / 2
}
```

**Calculation Logic:**
```typescript
function calculateSectionDuration(
  audioDuration: number,
  userSetDuration?: number
): SectionDuration {
  const minimumDuration = audioDuration + 1.0; // 0.5s buffer each side
  const actualDuration = Math.max(userSetDuration || minimumDuration, minimumDuration);
  const extraTime = actualDuration - audioDuration;
  const padding = extraTime / 2;
  
  return {
    audioDuration,
    minimumDuration,
    actualDuration,
    startPadding: padding,
    endPadding: padding,
  };
}
```

## Error Handling

### TTS Generation Errors

**Scenarios:**
1. **OpenAI API Failure** - Network error, API key invalid, rate limit
2. **R2 Upload Failure** - Storage error, network timeout
3. **Empty Transcript** - User clicks button with no text
4. **Composition Not Found** - Invalid composition ID

**Error Messages:**
- "Failed to generate speech: [specific error]"
- "Transcript text is required"
- "Network error: Unable to connect to TTS service"
- "Project not found"

**Error Handling:**
- Display error toast with specific message
- Keep "Generate Speech" button visible
- Log error to console for debugging
- Don't update form state on error

### Duration Validation Errors

**Scenarios:**
1. **Duration Too Short** - User tries to set duration below minimum

**Error Messages:**
- "Section duration must be at least X seconds (audio length + buffer)"

**Error Handling:**
- Prevent form submission
- Display validation error below duration input
- Highlight invalid field
- Show minimum required duration

## Testing Strategy

### Unit Tests

1. **TranscriptInput Component**
   - Renders correctly with/without audio
   - Shows button when transcript changes
   - Hides button when transcript unchanged
   - Displays audio duration correctly
   - Calls onGenerateSpeech with correct params

2. **Duration Calculation**
   - Calculates minimum duration correctly
   - Calculates padding correctly
   - Handles edge cases (zero duration, very long audio)
   - Validates user input correctly

3. **Change Detection**
   - Detects transcript changes accurately
   - Handles whitespace correctly
   - Resets after audio generation

### Integration Tests

1. **TTS Generation Flow**
   - Click button → API called → Form updated → Button hidden
   - Error handling → Toast shown → Button remains
   - Multiple sections → Independent generation

2. **Duration Management**
   - Audio generated → Duration updated → Video length changes
   - User increases duration → Padding calculated → Video plays correctly
   - Validation → Short duration rejected → Error shown

3. **Video Playback**
   - Audio plays at correct time
   - Padding applied correctly
   - Multiple sections play in sequence
   - Silent sections work correctly

### Manual Testing

1. **User Workflow**
   - Enter transcript → Generate speech → Verify audio
   - Modify transcript → Regenerate → Verify update
   - Set custom duration → Verify padding
   - Save project → Reload → Verify persistence

2. **Edge Cases**
   - Very long transcript (>500 words)
   - Very short transcript (<5 words)
   - Special characters in transcript
   - Multiple rapid generations
   - Network interruption during generation

## Implementation Notes

### Performance Considerations

1. **TTS Generation** - Can take 5-15 seconds, show loading state
2. **Audio Upload** - Large files may take time, show progress if possible
3. **Duration Calculation** - Recalculate only when necessary
4. **Change Detection** - Use debouncing to avoid excessive comparisons

### Accessibility

1. **Button Labels** - Clear "Generate Speech" text
2. **Loading States** - Announce to screen readers
3. **Error Messages** - Accessible and descriptive
4. **Duration Display** - Readable format with units

### Browser Compatibility

1. **Audio Playback** - Use standard HTML5 audio
2. **Fetch API** - Supported in all modern browsers
3. **Async/Await** - Transpile for older browsers if needed

### Security

1. **API Key** - Never expose OpenAI key in frontend
2. **Composition ID** - Validate on backend
3. **Text Input** - Sanitize before sending to API
4. **File Upload** - Validate file type and size on backend
