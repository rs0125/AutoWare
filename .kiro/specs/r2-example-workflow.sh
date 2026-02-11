#!/bin/bash
# Complete R2 Upload Workflow Example

set -e

API_BASE="http://localhost:5000/api"

echo "=== Step 1: Create a new composition ==="
COMP_RESPONSE=$(curl -s -X POST "$API_BASE/composition" \
  -H "Content-Type: application/json" \
  -d '{
    "intro": {
      "clientName": "Acme Warehousing",
      "projectLocationName": "Bangalore Tech Park"
    },
    "satDroneSection": {
      "location": {"lat": 12.9716, "lng": 77.5946},
      "audio": {
        "durationInSeconds": 8,
        "transcript": "Welcome to our state-of-the-art warehouse facility"
      }
    },
    "locationSection": {
      "nearbyPoints": [
        {"name": "NH-44", "type": "road", "distanceKm": 2.5}
      ],
      "audio": {
        "durationInSeconds": 6,
        "transcript": "Strategically located near major highways"
      }
    },
    "internalSection": {
      "wideShotVideoUrl": "",
      "specs": {
        "clearHeight": "35ft",
        "flooringType": "Concrete",
        "hasVentilation": true,
        "hasInsulation": false
      },
      "internalDockVideoUrl": "",
      "utilities": {
        "videoUrl": "",
        "featuresPresent": ["security_room", "canteen"]
      },
      "audio": {
        "durationInSeconds": 10,
        "transcript": "Modern amenities and high ceilings"
      }
    },
    "dockingSection": {
      "dockPanVideoUrl": "",
      "dockCount": 8,
      "audio": {
        "durationInSeconds": 5,
        "transcript": "Eight loading docks"
      }
    },
    "complianceSection": {
      "fireSafetyVideoUrl": "",
      "safetyFeatures": ["hydrants", "sprinklers"],
      "audio": {
        "durationInSeconds": 7,
        "transcript": "Fully compliant with fire safety"
      }
    }
  }')

COMP_ID=$(echo $COMP_RESPONSE | jq -r '.id')
echo "Created composition: $COMP_ID"

echo ""
echo "=== Step 2: Get batch presigned URLs for all media files ==="
PRESIGNED_RESPONSE=$(curl -s -X POST "$API_BASE/r2/presigned-urls/batch" \
  -H "Content-Type: application/json" \
  -d "{
    \"compositionId\": \"$COMP_ID\",
    \"files\": [
      {
        \"fileName\": \"drone-footage.mp4\",
        \"fileType\": \"video/mp4\",
        \"mediaType\": \"video\",
        \"fieldPath\": \"satDroneSection.droneVideoUrl\"
      },
      {
        \"fileName\": \"sat-intro-audio.mp3\",
        \"fileType\": \"audio/mpeg\",
        \"mediaType\": \"audio\",
        \"fieldPath\": \"satDroneSection.audio.audioUrl\"
      },
      {
        \"fileName\": \"approach-road.mp4\",
        \"fileType\": \"video/mp4\",
        \"mediaType\": \"video\",
        \"fieldPath\": \"locationSection.approachRoadVideoUrl\"
      },
      {
        \"fileName\": \"location-audio.mp3\",
        \"fileType\": \"audio/mpeg\",
        \"mediaType\": \"audio\",
        \"fieldPath\": \"locationSection.audio.audioUrl\"
      },
      {
        \"fileName\": \"internal-wide.mp4\",
        \"fileType\": \"video/mp4\",
        \"mediaType\": \"video\",
        \"fieldPath\": \"internalSection.wideShotVideoUrl\"
      },
      {
        \"fileName\": \"internal-audio.mp3\",
        \"fileType\": \"audio/mpeg\",
        \"mediaType\": \"audio\",
        \"fieldPath\": \"internalSection.audio.audioUrl\"
      }
    ]
  }")

echo "Generated presigned URLs:"
echo $PRESIGNED_RESPONSE | jq '.uploads | map({fieldPath, publicUrl})'

echo ""
echo "=== Step 3: Upload files to R2 (simulated) ==="
echo "In production, you would upload files using the presigned URLs:"
echo "curl -X PUT '<uploadUrl>' -H 'Content-Type: video/mp4' --data-binary @file.mp4"

echo ""
echo "=== Step 4: Update composition with public URLs ==="

# Extract public URLs and create mapping
URL_MAPPINGS=$(echo $PRESIGNED_RESPONSE | jq -c '.uploads | map({(.fieldPath): .publicUrl}) | add')

UPDATE_RESPONSE=$(curl -s -X POST "$API_BASE/composition/$COMP_ID/media-urls" \
  -H "Content-Type: application/json" \
  -d "{\"urlMappings\": $URL_MAPPINGS}")

echo "Updated composition with media URLs"

echo ""
echo "=== Step 5: Verify final composition ==="
curl -s "$API_BASE/composition/$COMP_ID" | jq '{
  id,
  intro: .composition_components.intro,
  mediaFiles: {
    droneVideo: .composition_components.satDroneSection.droneVideoUrl,
    satAudio: .composition_components.satDroneSection.audio.audioUrl,
    approachVideo: .composition_components.locationSection.approachRoadVideoUrl,
    locationAudio: .composition_components.locationSection.audio.audioUrl,
    internalVideo: .composition_components.internalSection.wideShotVideoUrl,
    internalAudio: .composition_components.internalSection.audio.audioUrl
  }
}'

echo ""
echo "=== Workflow Complete! ==="
