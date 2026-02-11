# Maps API Usage Guide

## Getting Accurate Coordinates from Google Maps

The Maps API works best with Google Maps URLs that contain actual coordinates. Here's how to get them:

### Method 1: Right-click on the map (Most Accurate)
1. Open Google Maps
2. Right-click on the exact location you want
3. Click "What's here?"
4. Copy the coordinates shown at the bottom (e.g., `18.971294, 73.131080`)
5. Use these coordinates directly in the API request

### Method 2: Share with coordinates in URL
1. Open Google Maps and navigate to your location
2. Click the Share button
3. Copy the link - it should contain `@lat,lng,zoom` format
4. Example: `https://www.google.com/maps/@18.971294,73.131080,16z`

### Method 3: Use the URL bar
After navigating to a location, the URL bar often contains coordinates in this format:
`https://www.google.com/maps/@18.971294,73.131080,16z`

## Fallback: Place Name Geocoding

If the URL doesn't contain coordinates (like shortened `goo.gl` links), the API will:
1. Resolve the shortened URL
2. Try to extract the place name
3. Use Mapbox geocoding to find coordinates

**⚠️ Warning:** Geocoding is less accurate and may not pinpoint the exact location, especially for:
- Specific buildings or warehouses
- Locations with similar names
- Rural or less-documented areas

## API Request Examples

### With Direct Coordinates (Recommended)
```json
{
  "compositionId": "uuid-here",
  "coordinates": {
    "lat": 18.971294,
    "lng": 73.131080
  },
  "options": {
    "zoom": 16,
    "width": 1280,
    "height": 720
  }
}
```

### With Google Maps URL
```json
{
  "compositionId": "uuid-here",
  "googleMapsUrl": "https://www.google.com/maps/@18.971294,73.131080,16z",
  "options": {
    "zoom": 16
  }
}
```

### With Shortened URL (Less Accurate)
```json
{
  "compositionId": "uuid-here",
  "googleMapsUrl": "https://maps.app.goo.gl/hUG3kpN75GQtcsdS7",
  "options": {
    "zoom": 16
  }
}
```
