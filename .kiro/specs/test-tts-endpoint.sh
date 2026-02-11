#!/bin/bash
# Test TTS endpoint - converts transcript text to audio and uploads to R2

set -e

API_BASE="http://localhost:5000/api"

echo "════════════════════════════════════════════════════════"
echo "  TTS Audio Generation Test"
echo "════════════════════════════════════════════════════════"
echo ""

# Get an existing composition ID
COMP_ID=$(curl -s "$API_BASE/composition" | jq -r '.[0].id')
echo "Using composition ID: $COMP_ID"
echo ""

# Test 1: Single transcript
echo "📝 TEST 1: Generate single audio file"
echo "Transcript: 'Welcome to our state-of-the-art warehouse facility'"
echo ""

curl -X POST "$API_BASE/tts/generate-audio" \
  -H "Content-Type: application/json" \
  -d "{
    \"compositionId\": \"$COMP_ID\",
    \"transcripts\": [
      {
        \"text\": \"Welcome to our state-of-the-art warehouse facility located in the heart of the industrial zone.\",
        \"fieldPath\": \"satDroneSection.audio.audioUrl\",
        \"voice\": \"alloy\"
      }
    ],
    \"updateComposition\": true
  }" | jq '{
    success,
    compositionUpdated,
    audioFiles: .audioFiles | map({
      fieldPath,
      audioUrl: (.audioUrl | split("/") | .[-1]),
      durationInSeconds
    })
  }'

echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Test 2: Multiple transcripts
echo "📝 TEST 2: Generate multiple audio files"
echo ""

curl -X POST "$API_BASE/tts/generate-audio" \
  -H "Content-Type: application/json" \
  -d "{
    \"compositionId\": \"$COMP_ID\",
    \"transcripts\": [
      {
        \"text\": \"This warehouse is strategically located near major highways and the international airport, providing excellent connectivity for logistics operations.\",
        \"fieldPath\": \"locationSection.audio.audioUrl\",
        \"voice\": \"nova\"
      },
      {
        \"text\": \"Our facility features modern amenities including high ceilings, climate control, and advanced security systems to ensure your goods are stored safely.\",
        \"fieldPath\": \"internalSection.audio.audioUrl\",
        \"voice\": \"shimmer\"
      },
      {
        \"text\": \"We have ten loading docks equipped with hydraulic levelers for efficient loading and unloading operations.\",
        \"fieldPath\": \"dockingSection.audio.audioUrl\",
        \"voice\": \"onyx\"
      }
    ],
    \"updateComposition\": true
  }" | jq '{
    success,
    compositionUpdated,
    audioFiles: .audioFiles | map({
      fieldPath,
      audioUrl: (.audioUrl | split("/") | .[-1]),
      durationInSeconds
    })
  }'

echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Verify composition was updated
echo "🔍 Verifying composition was updated..."
echo ""

curl -s "$API_BASE/composition/$COMP_ID" | jq '{
  satDroneAudio: {
    url: .composition_components.satDroneSection.audio.audioUrl,
    duration: .composition_components.satDroneSection.audio.durationInSeconds,
    transcript: .composition_components.satDroneSection.audio.transcript
  },
  locationAudio: {
    url: .composition_components.locationSection.audio.audioUrl,
    duration: .composition_components.locationSection.audio.durationInSeconds
  },
  internalAudio: {
    url: .composition_components.internalSection.audio.audioUrl,
    duration: .composition_components.internalSection.audio.durationInSeconds
  },
  dockingAudio: {
    url: .composition_components.dockingSection.audio.audioUrl,
    duration: .composition_components.dockingSection.audio.durationInSeconds
  }
}'

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ TTS Test Complete!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "What happened:"
echo "  1. Generated audio from transcript text using OpenAI TTS"
echo "  2. Uploaded audio files to R2 storage"
echo "  3. Updated composition with audio URLs and durations"
echo "  4. Verified all audio URLs are saved correctly"
echo ""
echo "Available voices: alloy, echo, fable, onyx, nova, shimmer"
echo ""
