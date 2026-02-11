# R2 Upload Workflow for Video Compositions

## Overview
Cloudflare R2 integration for uploading media files (videos, audio, images) and associating them with video compositions.

## Workflow

### 1. Create Composition
First, create a composition with placeholder or empty media URLs:
```bash
POST /api/composition
```

### 2. Get Presigned Upload URLs
Request presigned URLs for uploading media files:

**Single File:**
```bash
POST /api/r2/presigned-url
{
  "fileName": "drone-footage.mp4",
  "fileType": "video/mp4",
  "compositionId": "uuid",
  "mediaType": "video"
}
```

**Batch Upload:**
```bash
POST /api/r2/presigned-urls/batch
{
  "compositionId": "uuid",
  "files": [
    {
      "fileName": "drone.mp4",
      "fileType": "video/mp4",
      "mediaType": "video",
      "fieldPath": "satDroneSection.droneVideoUrl"
    },
    {
      "fileName": "intro-audio.mp3",
      "fileType": "audio/mpeg",
      "mediaType": "audio",
      "fieldPath": "satDroneSection.audio.audioUrl"
    }
  ]
}
```

### 3. Upload Files to R2
Use the presigned URLs to upload files directly to R2 from the client:
```bash
curl -X PUT "presigned-upload-url" \
  -H "Content-Type: video/mp4" \
  --data-binary @drone-footage.mp4
```

### 4. Update Composition with Public URLs
After successful upload, update the composition with the public URLs:
```bash
POST /api/composition/:id/media-urls
{
  "urlMappings": {
    "satDroneSection.droneVideoUrl": "https://your-bucket.r2.dev/compositions/uuid/video/...",
    "satDroneSection.audio.audioUrl": "https://your-bucket.r2.dev/compositions/uuid/audio/..."
  }
}
```

## API Endpoints

### POST /api/r2/presigned-url
Generate a presigned URL for single file upload.

**Request:**
```json
{
  "fileName": "string",
  "fileType": "string (MIME type)",
  "compositionId": "uuid",
  "mediaType": "video" | "audio" | "image"
}
```

**Response:**
```json
{
  "uploadUrl": "presigned S3 URL",
  "publicUrl": "public R2 URL",
  "key": "file key in bucket",
  "expiresIn": 3600
}
```

### POST /api/r2/presigned-urls/batch
Generate multiple presigned URLs for batch upload.

**Request:**
```json
{
  "compositionId": "uuid",
  "files": [
    {
      "fileName": "string",
      "fileType": "string",
      "mediaType": "video" | "audio" | "image",
      "fieldPath": "path.to.field"
    }
  ]
}
```

**Response:**
```json
{
  "uploads": [
    {
      "fieldPath": "satDroneSection.droneVideoUrl",
      "uploadUrl": "presigned URL",
      "publicUrl": "public URL",
      "key": "file key",
      "expiresIn": 3600
    }
  ]
}
```

### POST /api/composition/:id/media-urls
Update media URLs in composition after upload.

**Request:**
```json
{
  "urlMappings": {
    "fieldPath": "public URL",
    "satDroneSection.droneVideoUrl": "https://...",
    "locationSection.audio.audioUrl": "https://..."
  }
}
```

**Response:** Updated composition object

## Configuration

Add to `.env`:
```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=warehouse-videos
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

## File Organization in R2

Files are organized by composition:
```
compositions/
  {composition-id}/
    video/
      {timestamp}-{random}.mp4
    audio/
      {timestamp}-{random}.mp3
    image/
      {timestamp}-{random}.jpg
```

## Security

- Presigned URLs expire after 1 hour
- Files are organized by composition ID
- Each file gets a unique timestamp + random string
- Public URLs are only accessible after successful upload
