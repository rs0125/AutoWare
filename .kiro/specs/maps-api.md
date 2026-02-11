# Satellite Image Generation API

## Endpoint

**POST /api/maps/satellite-image**

Extracts coordinates from Google Maps URL, generates a labeled satellite image using Mapbox, uploads to R2, and optionally updates the composition.

## Request Body

```json
{
  "compositionId": "uuid",
  "googleMapsUrl": "https://www.google.com/maps/@12.9716,77.5946,15z",
  "options": {
    "zoom": 16,
    "width": 1280,
    "height": 720,
    "style": "satellite-streets-v12"
  },
  "updateComposition": true,
  "fieldPath": "satDroneSection.satelliteImageUrl"
}
```

### Parameters

- **compositionId** (string, required): UUID of the composition
- **googleMapsUrl** (string, optional): Google Maps URL to extract coordinates from
- **coordinates** (object, optional): Direct coordinates `{lat, lng}`
- **options** (object, optional):
  - **zoom** (number, 1-22): Map zoom level (default: 16)
  - **width** (number, 100-1280): Image width in pixels (default: 1280)
  - **height** (number, 100-1280): Image height in pixels (default: 720)
  - **style** (string): Mapbox style (default: 'satellite-streets-v12')
- **updateComposition** (boolean, optional): Auto-update composition (default: true)
- **fieldPath** (string, optional): Where to save image URL (default: 'satDroneSection.satelliteImageUrl')

### Mapbox Styles

- **satellite-streets-v12** - Satellite imagery with road/label overlay (recommended)
- **satellite-v9** - Pure satellite imagery without labels
- **streets-v12** - Street map view

## Response

```json
{
  "success": true,
  "imageUrl": "https://pub-xxx.r2.dev/compositions/uuid/image/timestamp-random-satellite.jpg",
  "key": "compositions/uuid/image/timestamp-random-satellite.jpg",
  "coordinates": {
    "lat": 12.9716,
    "lng": 77.5946
  },
  "compositionUpdated": true
}
```

## Examples

### From Google Maps URL

```bash
curl -X POST http://localhost:5000/api/maps/satellite-image \
  -H "Content-Type: application/json" \
  -d '{
    "compositionId": "5491c25a-dc35-4b65-a51f-70faa64bc3e8",
    "googleMapsUrl": "https://www.google.com/maps/@12.9716,77.5946,15z",
    "options": {
      "zoom": 16,
      "style": "satellite-streets-v12"
    }
  }'
```

### From Direct Coordinates

```bash
curl -X POST http://localhost:5000/api/maps/satellite-image \
  -H "Content-Type: application/json" \
  -d '{
    "compositionId": "5491c25a-dc35-4b65-a51f-70faa64bc3e8",
    "coordinates": {
      "lat": 19.0760,
      "lng": 72.8777
    },
    "options": {
      "zoom": 17,
      "width": 1920,
      "height": 1080
    }
  }'
```

### Without Updating Composition

```bash
curl -X POST http://localhost:5000/api/maps/satellite-image \
  -H "Content-Type: application/json" \
  -d '{
    "compositionId": "5491c25a-dc35-4b65-a51f-70faa64bc3e8",
    "googleMapsUrl": "https://www.google.com/maps/@28.6139,77.2090,12z",
    "updateComposition": false
  }'
```

## What It Does

1. **Extract Coordinates**: Parses Google Maps URL to get lat/lng
2. **Generate Image**: Calls Mapbox Static Images API with marker overlay
3. **Upload to R2**: Stores image at `compositions/{id}/image/{timestamp}-{random}-satellite.jpg`
4. **Update Composition**: Saves image URL and coordinates (if enabled)

## Auto-Update Behavior

When `updateComposition: true` (default):
- Updates image URL at `fieldPath` (default: `satDroneSection.satelliteImageUrl`)
- Updates coordinates at `satDroneSection.location`

## Supported Google Maps URL Formats

- `https://www.google.com/maps/@12.9716,77.5946,15z`
- `https://www.google.com/maps/place/@19.0760,72.8777,17z`
- `https://maps.google.com/?ll=28.6139,77.2090&z=12`

## Configuration

Get a free Mapbox access token at https://account.mapbox.com/

Add to `.env`:
```env
MAPBOX_ACCESS_TOKEN=pk.eyJ1...
```

## Pricing

**Mapbox Static Images API:**
- 50,000 free requests/month
- $0.50 per 1,000 requests after that
- Much cheaper than Google Maps

## Error Responses

**400 Bad Request** - Invalid URL or coordinates
```json
{
  "error": "Could not extract coordinates from Google Maps URL"
}
```

**404 Not Found** - Composition doesn't exist
```json
{
  "error": "Composition not found"
}
```

**500 Internal Server Error** - Mapbox API error
```json
{
  "error": "Internal server error",
  "message": "Failed to fetch map image: ..."
}
```
