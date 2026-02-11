# TTS Voice Guide for Warehouse Showcases

## Recommended Voice Settings

For professional warehouse showcase videos, we recommend:

- **Model**: `tts-1-hd` (OpenAI) or `eleven_multilingual_v2` (ElevenLabs)
- **Default Voice**: `onyx` (Professional, clear, authoritative)
- **Indian Accent**: `indian-male` or `indian-female` (ElevenLabs)
- **Speed**: `1.0` (Natural pacing)

## Available Voices

### Indian Accent Voices (ElevenLabs) 🇮🇳

#### indian-male ⭐
- **Best for**: Professional Indian English narration
- **Characteristics**: Clear, professional, Indian accent, male voice
- **Use case**: Warehouse showcases targeting Indian market
- **Provider**: ElevenLabs

#### indian-female
- **Best for**: Professional Indian English narration
- **Characteristics**: Clear, professional, Indian accent, female voice
- **Use case**: Modern, professional showcases for Indian market
- **Provider**: ElevenLabs

### OpenAI Voices (American/Neutral English)

#### Onyx (Recommended for International) ⭐
- **Best for**: Professional warehouse showcases, corporate presentations
- **Characteristics**: Deep, authoritative, clear, professional
- **Use case**: Main narration for warehouse features and specifications
- **Provider**: OpenAI

### Alloy
- **Best for**: Neutral, balanced presentations
- **Characteristics**: Neutral tone, versatile, clear
- **Use case**: General purpose narration

### Echo
- **Best for**: Warm, friendly presentations
- **Characteristics**: Warm, approachable, male voice
- **Use case**: Client-focused messaging

### Fable
- **Best for**: Engaging storytelling
- **Characteristics**: Expressive, British accent
- **Use case**: Highlighting unique features

### Nova
- **Best for**: Energetic presentations
- **Characteristics**: Bright, energetic, female voice
- **Use case**: Modern, dynamic showcases

### Shimmer
- **Best for**: Soft, professional presentations
- **Characteristics**: Soft, clear, female voice
- **Use case**: Elegant, refined showcases

## Speed Settings

- **0.9**: Slightly slower, more deliberate (good for technical details)
- **1.0**: Natural pacing (recommended default)
- **1.1**: Slightly faster, more energetic

## Text Enhancement

The system automatically enhances your text for better narration by:

1. Adding natural pauses after introductory phrases
2. Emphasizing numbers and measurements
3. Improving flow with proper punctuation
4. Creating better pacing for location names

## Example Transcripts

### Good Examples:

✅ "Welcome to Greater Noida Industrial Hub, strategically located for optimal logistics operations."

✅ "The warehouse features 12-meter clear height with anti-skid epoxy flooring, complete with ventilation and insulation."

✅ "Located just 2 kilometers from NH-24 highway and 5 kilometers from Noida Metro Station."

### Tips for Better Audio:

1. **Use complete sentences** - Avoid fragments
2. **Include measurements** - "12 meters" sounds more professional than "12m"
3. **Be specific** - "anti-skid epoxy flooring" vs "good flooring"
4. **Natural flow** - Write as you would speak
5. **Avoid abbreviations** - Write "square feet" not "sq ft"

## API Usage

```typescript
// Indian male voice (ElevenLabs)
{
  text: "Welcome to our state-of-the-art warehouse facility in Greater Noida.",
  fieldPath: "satDroneSection.audio.transcript",
  voice: "indian-male",  // Automatically uses ElevenLabs
  speed: 1.0
}

// Indian female voice (ElevenLabs)
{
  text: "The facility features 15-meter clear height with advanced systems.",
  fieldPath: "internalSection.audio.transcript",
  voice: "indian-female",
  speed: 1.0
}

// OpenAI voice (fallback/international)
{
  text: "Discover cutting-edge logistics solutions.",
  fieldPath: "satDroneSection.audio.transcript",
  voice: "onyx",  // Uses OpenAI
  speed: 1.0
}

// Force specific provider
{
  text: "Your transcript text",
  fieldPath: "satDroneSection.audio.transcript",
  voice: "onyx",
  provider: "openai",  // Explicitly use OpenAI
  speed: 1.0
}
```

## Setup Requirements

### OpenAI (Default)
Set in your `.env`:
```
OPENAI_API_KEY=your_openai_api_key
```

### ElevenLabs (For Indian Voices)
Set in your `.env`:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Get your ElevenLabs API key from: https://elevenlabs.io/

## How It Works

1. **Automatic Provider Selection**: 
   - `indian-male` and `indian-female` automatically use ElevenLabs
   - All other voices use OpenAI by default

2. **Fallback System**:
   - If ElevenLabs API key is not configured, an error will be thrown
   - OpenAI voices always work if OPENAI_API_KEY is set

3. **Voice Quality**:
   - Both providers use high-quality models
   - ElevenLabs: `eleven_multilingual_v2`
   - OpenAI: `tts-1-hd`
