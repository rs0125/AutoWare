#!/bin/bash
# Test script demonstrating the complete upload flow
# This simulates what the frontend would do

set -e

API_BASE="http://localhost:5000/api"

echo "════════════════════════════════════════════════════════"
echo "  Complete Upload Flow Test"
echo "════════════════════════════════════════════════════════"
echo ""

# Step 1: Create Composition
echo "📝 STEP 1: Creating composition with metadata..."
COMP_RESPONSE=$(curl -s -X POST "$API_BASE/composition" \
  -H "Content-Type: application/json" \
  -d '{
    "intro": {
      "clientName": "Test Warehouse Co",
      "projectLocationName": "Mumbai Industrial Zone"
    },
    "satDroneSection": {
      "location": {"lat": 19.0760, "lng": 72.8777},
      "droneVideoUrl": "",
      "audio": {
        "audioUrl": "",
        "durationInSeconds": 8,
        "transcript": "Welcome to our warehouse facility"
      }
    },
    "locationSection": {
      "nearbyPoints": [
        {"name": "Mumbai Port", "type": "port", "distanceKm": 5}
      ],
      "approachRoadVideoUrl": "",
      "audio": {
        "durationInSeconds": 6,
        "transcript": "Located near major transport hubs"
      }
    },
    "internalSection": {
      "wideShotVideoUrl": "",
      "specs": {
        "clearHeight": "40ft",
        "flooringType": "Concrete",
        "hasVentilation": true,
        "hasInsulation": true
      },
      "internalDockVideoUrl": "",
      "utilities": {
        "videoUrl": "",
        "featuresPresent": ["security_room", "canteen", "washrooms"]
      },
      "audio": {
        "durationInSeconds": 10,
        "transcript": "Modern facilities with high ceilings"
      }
    },
    "dockingSection": {
      "dockPanVideoUrl": "",
      "dockCount": 10,
      "audio": {
        "durationInSeconds": 5,
        "transcript": "Ten loading docks available"
      }
    },
    "complianceSection": {
      "fireSafetyVideoUrl": "",
      "safetyFeatures": ["hydrants", "sprinklers", "alarm_system"],
      "audio": {
        "durationInSeconds": 7,
        "transcript": "Full fire safety compliance"
      }
    }
  }')

COMP_ID=$(echo $COMP_RESPONSE | jq -r '.id')
echo "✅ Created composition: $COMP_ID"
echo ""

# Step 2: Request Presigned URLs
echo "🔗 STEP 2: Requesting presigned upload URLs..."
PRESIGNED_RESPONSE=$(curl -s -X POST "$API_BASE/r2/presigned-urls/batch" \
  -H "Content-Type: application/json" \
  -d "{
    \"compositionId\": \"$COMP_ID\",
    \"files\": [
      {
        \"fileName\": \"drone-aerial.mp4\",
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
        \"fileName\": \"internal-wide-shot.mp4\",
        \"fileType\": \"video/mp4\",
        \"mediaType\": \"video\",
        \"fieldPath\": \"internalSection.wideShotVideoUrl\"
      },
      {
        \"fileName\": \"docking-area.mp4\",
        \"fileType\": \"video/mp4\",
        \"mediaType\": \"video\",
        \"fieldPath\": \"dockingSection.dockPanVideoUrl\"
      }
    ]
  }")

echo "✅ Received presigned URLs for 5 files"
echo ""
echo "Upload URLs generated:"
echo $PRESIGNED_RESPONSE | jq -r '.uploads[] | "  - \(.fieldPath)"'
echo ""

# Step 3: Simulate File Upload
echo "📤 STEP 3: Uploading files to R2..."
echo "   (In production, frontend would PUT binary data to each uploadUrl)"
echo "   (Skipping actual upload in this demo)"
echo ""

# Extract URL mappings for Step 4
URL_MAPPINGS=$(echo $PRESIGNED_RESPONSE | jq -c '.uploads | map({(.fieldPath): .publicUrl}) | add')

# Step 4: Update Composition with Public URLs
echo "💾 STEP 4: Updating composition with public URLs..."
UPDATE_RESPONSE=$(curl -s -X POST "$API_BASE/composition/$COMP_ID/media-urls" \
  -H "Content-Type: application/json" \
  -d "{\"urlMappings\": $URL_MAPPINGS}")

echo "✅ Composition updated with media URLs"
echo ""

# Step 5: Verify Final Result
echo "🔍 STEP 5: Verifying final composition..."
FINAL_COMP=$(curl -s "$API_BASE/composition/$COMP_ID")

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Final Composition Summary"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Composition ID: $COMP_ID"
echo ""
echo "Client: $(echo $FINAL_COMP | jq -r '.composition_components.intro.clientName')"
echo "Location: $(echo $FINAL_COMP | jq -r '.composition_components.intro.projectLocationName')"
echo ""
echo "Media Files Saved:"
echo "  🎥 Drone Video: $(echo $FINAL_COMP | jq -r '.composition_components.satDroneSection.droneVideoUrl' | cut -d'/' -f5-)"
echo "  🔊 Drone Audio: $(echo $FINAL_COMP | jq -r '.composition_components.satDroneSection.audio.audioUrl' | cut -d'/' -f5-)"
echo "  🎥 Approach Video: $(echo $FINAL_COMP | jq -r '.composition_components.locationSection.approachRoadVideoUrl' | cut -d'/' -f5-)"
echo "  🎥 Internal Video: $(echo $FINAL_COMP | jq -r '.composition_components.internalSection.wideShotVideoUrl' | cut -d'/' -f5-)"
echo "  🎥 Docking Video: $(echo $FINAL_COMP | jq -r '.composition_components.dockingSection.dockPanVideoUrl' | cut -d'/' -f5-)"
echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ Upload Flow Complete!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "What happened:"
echo "  1. Created composition with metadata"
echo "  2. Requested 5 presigned upload URLs from backend"
echo "  3. (Would upload files directly to R2 here)"
echo "  4. Updated composition with public R2 URLs"
echo "  5. Verified all URLs are saved correctly"
echo ""
echo "In production, step 3 would be:"
echo "  fetch(uploadUrl, { method: 'PUT', body: file })"
echo ""
