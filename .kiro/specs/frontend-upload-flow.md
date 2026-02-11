# Frontend to Backend Upload Flow

## Complete API Flow Sequence

### Scenario: User creates a video composition and uploads media files

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │         │   Backend   │         │  R2 Storage │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Create Composition │                        │
       ├──────────────────────>│                        │
       │ POST /api/composition │                        │
       │ (with metadata only)  │                        │
       │                       │                        │
       │<──────────────────────┤                        │
       │ { id: "uuid", ... }   │                        │
       │                       │                        │
       │ 2. Request Upload URLs│                        │
       ├──────────────────────>│                        │
       │ POST /api/r2/         │                        │
       │   presigned-urls/batch│                        │
       │ (list of files)       │                        │
       │                       │                        │
       │<──────────────────────┤                        │
       │ { uploads: [          │                        │
       │   {uploadUrl, publicUrl}│                      │
       │ ]}                    │                        │
       │                       │                        │
       │ 3. Upload Files       │                        │
       ├───────────────────────┼───────────────────────>│
       │ PUT uploadUrl         │                        │
       │ (binary file data)    │                        │
       │                       │                        │
       │<──────────────────────┼────────────────────────┤
       │ 200 OK                │                        │
       │                       │                        │
       │ 4. Update Composition │                        │
       ├──────────────────────>│                        │
       │ POST /api/composition/│                        │
       │   {id}/media-urls     │                        │
       │ (publicUrl mappings)  │                        │
       │                       │                        │
       │<──────────────────────┤                        │
       │ { updated composition }│                       │
       │                       │                        │
```

## Step-by-Step Implementation

### Step 1: Create Composition (Frontend)

```typescript
// Create composition with metadata and placeholders
const createComposition = async (formData: CompositionFormData) => {
  const response = await fetch('http://localhost:5000/api/composition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intro: {
        clientName: formData.clientName,
        projectLocationName: formData.location,
      },
      satDroneSection: {
        location: formData.coordinates,
        droneVideoUrl: '', // Empty - will be filled after upload
        audio: {
          audioUrl: '', // Empty - will be filled after upload
          durationInSeconds: 8,
          transcript: formData.satDroneTranscript,
        },
      },
      // ... other sections
    }),
  });

  const composition = await response.json();
  return composition.id; // Save this ID!
};
```

### Step 2: Request Presigned URLs (Frontend)

```typescript
// Prepare list of files to upload
const requestUploadUrls = async (
  compositionId: string,
  files: {
    file: File;
    fieldPath: string;
    mediaType: 'video' | 'audio' | 'image';
  }[]
) => {
  const response = await fetch('http://localhost:5000/api/r2/presigned-urls/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compositionId,
      files: files.map((f) => ({
        fileName: f.file.name,
        fileType: f.file.type,
        mediaType: f.mediaType,
        fieldPath: f.fieldPath,
      })),
    }),
  });

  const data = await response.json();
  return data.uploads; // Array of {uploadUrl, publicUrl, fieldPath}
};
```

### Step 3: Upload Files to R2 (Frontend)

```typescript
// Upload each file using presigned URL
const uploadFileToR2 = async (file: File, uploadUrl: string) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response;
};

// Upload all files in parallel
const uploadAllFiles = async (
  files: File[],
  uploadData: Array<{ uploadUrl: string; publicUrl: string; fieldPath: string }>
) => {
  const uploadPromises = files.map((file, index) => 
    uploadFileToR2(file, uploadData[index].uploadUrl)
  );

  await Promise.all(uploadPromises);
  
  // Return mapping of fieldPath -> publicUrl
  return uploadData.reduce((acc, item) => {
    acc[item.fieldPath] = item.publicUrl;
    return acc;
  }, {} as Record<string, string>);
};
```

### Step 4: Update Composition with URLs (Frontend)

```typescript
// Save public URLs to composition
const updateCompositionUrls = async (
  compositionId: string,
  urlMappings: Record<string, string>
) => {
  const response = await fetch(
    `http://localhost:5000/api/composition/${compositionId}/media-urls`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlMappings }),
    }
  );

  return await response.json();
};
```

## Complete Frontend Flow Example

```typescript
// Complete upload workflow
const saveCompositionWithMedia = async (
  formData: CompositionFormData,
  mediaFiles: {
    droneVideo: File;
    droneAudio: File;
    approachVideo: File;
    internalVideo: File;
    // ... more files
  }
) => {
  try {
    // Step 1: Create composition
    console.log('Creating composition...');
    const compositionId = await createComposition(formData);

    // Step 2: Prepare file list with field paths
    const filesToUpload = [
      {
        file: mediaFiles.droneVideo,
        fieldPath: 'satDroneSection.droneVideoUrl',
        mediaType: 'video' as const,
      },
      {
        file: mediaFiles.droneAudio,
        fieldPath: 'satDroneSection.audio.audioUrl',
        mediaType: 'audio' as const,
      },
      {
        file: mediaFiles.approachVideo,
        fieldPath: 'locationSection.approachRoadVideoUrl',
        mediaType: 'video' as const,
      },
      {
        file: mediaFiles.internalVideo,
        fieldPath: 'internalSection.wideShotVideoUrl',
        mediaType: 'video' as const,
      },
    ];

    // Step 3: Request presigned URLs
    console.log('Requesting upload URLs...');
    const uploadData = await requestUploadUrls(compositionId, filesToUpload);

    // Step 4: Upload files to R2
    console.log('Uploading files to R2...');
    const urlMappings = await uploadAllFiles(
      filesToUpload.map((f) => f.file),
      uploadData
    );

    // Step 5: Update composition with public URLs
    console.log('Updating composition with URLs...');
    const updatedComposition = await updateCompositionUrls(
      compositionId,
      urlMappings
    );

    console.log('✅ Composition saved successfully!', updatedComposition);
    return updatedComposition;
  } catch (error) {
    console.error('❌ Error saving composition:', error);
    throw error;
  }
};
```

## React Hook Example

```typescript
import { useState } from 'react';

export const useCompositionUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadComposition = async (
    formData: CompositionFormData,
    mediaFiles: Record<string, File>
  ) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Create composition (10%)
      setProgress(10);
      const compositionId = await createComposition(formData);

      // Step 2: Request URLs (20%)
      setProgress(20);
      const filesToUpload = Object.entries(mediaFiles).map(([key, file]) => ({
        file,
        fieldPath: getFieldPath(key), // Map UI key to field path
        mediaType: getMediaType(file.type),
      }));

      const uploadData = await requestUploadUrls(compositionId, filesToUpload);

      // Step 3: Upload files (20% -> 80%)
      setProgress(30);
      const files = filesToUpload.map((f) => f.file);
      
      // Upload with progress tracking
      const urlMappings: Record<string, string> = {};
      for (let i = 0; i < files.length; i++) {
        await uploadFileToR2(files[i], uploadData[i].uploadUrl);
        urlMappings[uploadData[i].fieldPath] = uploadData[i].publicUrl;
        setProgress(30 + ((i + 1) / files.length) * 50);
      }

      // Step 4: Update composition (90%)
      setProgress(90);
      const result = await updateCompositionUrls(compositionId, urlMappings);

      setProgress(100);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadComposition, uploading, progress, error };
};
```

## Usage in Component

```tsx
const CompositionEditor = () => {
  const { uploadComposition, uploading, progress, error } = useCompositionUpload();
  const [files, setFiles] = useState<Record<string, File>>({});

  const handleSubmit = async (formData: CompositionFormData) => {
    try {
      const composition = await uploadComposition(formData, files);
      console.log('Saved:', composition);
      // Navigate to success page or show composition
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  return (
    <div>
      {/* File upload inputs */}
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFiles({ ...files, droneVideo: e.target.files[0] })}
      />
      
      {/* Form fields */}
      
      <button onClick={handleSubmit} disabled={uploading}>
        {uploading ? `Uploading... ${progress}%` : 'Save Composition'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

## Error Handling

```typescript
// Retry logic for failed uploads
const uploadWithRetry = async (
  file: File,
  uploadUrl: string,
  maxRetries = 3
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await uploadFileToR2(file, uploadUrl);
      return; // Success
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Retry ${attempt}/${maxRetries} for ${file.name}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

## Key Points

1. **Create composition first** - Get the ID before uploading files
2. **Request presigned URLs** - Backend generates secure upload URLs
3. **Upload directly to R2** - Files never go through your backend
4. **Update composition** - Save public URLs after successful upload
5. **Handle errors** - Implement retry logic and user feedback
6. **Show progress** - Keep users informed during long uploads
7. **Validate files** - Check file types and sizes before uploading

## Benefits of This Flow

- ✅ **Efficient**: Files upload directly to R2, not through backend
- ✅ **Scalable**: Backend doesn't handle large file transfers
- ✅ **Secure**: Presigned URLs expire after 1 hour
- ✅ **Fast**: Parallel uploads for multiple files
- ✅ **Reliable**: Can retry failed uploads without recreating composition
