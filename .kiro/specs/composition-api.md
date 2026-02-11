# Video Composition API Endpoints

## Overview
RESTful API endpoints for managing video compositions based on the warehouse video schema.

## Requirements

### Endpoints to Implement

1. **GET /api/composition** - List all compositions
   - Query params: pagination (limit, offset), sorting (by created_at, updated_at)
   - Returns: Array of compositions

2. **GET /api/composition/:id** - Get single composition by UUID
   - Returns: Single composition or 404

3. **POST /api/composition** - Create new composition
   - Body: composition_components (JSON matching CompositionProps schema)
   - Validation: Validate against zod schema
   - Returns: Created composition with UUID

4. **PUT /api/composition/:id** - Replace entire composition
   - Body: Complete composition_components
   - Returns: Updated composition

5. **PATCH /api/composition/:id** - Partial update of composition
   - Body: Partial composition_components (deep merge)
   - Returns: Updated composition

6. **DELETE /api/composition/:id** - Delete composition
   - Returns: Success message

### Validation
- Use zod schema from @repo/shared for validation
- Return 400 with validation errors if invalid
- Handle optional fields gracefully

### Error Handling
- 400: Bad request / validation errors
- 404: Composition not found
- 500: Internal server error

## Implementation Tasks

- [x] Create VideoComposition table in Supabase
- [x] Basic GET/POST endpoints
- [x] Add validation middleware with zod
- [x] Implement PUT endpoint
- [x] Implement PATCH endpoint with deep merge
- [x] Implement DELETE endpoint
- [x] Add pagination and sorting to GET all
- [x] Add error handling and proper status codes
- [x] Test all endpoints with curl

## API Documentation

### GET /api/composition
List all compositions with optional pagination and sorting.

**Query Parameters:**
- `limit` (number, optional): Max results to return (default: 50)
- `offset` (number, optional): Number of results to skip (default: 0)
- `sortBy` (string, optional): Field to sort by - `created_at` or `updated_at` (default: created_at)
- `sortOrder` (string, optional): Sort direction - `asc` or `desc` (default: desc)

**Response:** 200 OK
```json
[
  {
    "id": "uuid",
    "composition_components": {...},
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### GET /api/composition/:id
Get a single composition by UUID.

**Response:** 200 OK or 404 Not Found

### POST /api/composition
Create a new composition. Validates against CompositionProps schema.

**Request Body:**
```json
{
  "intro": {
    "clientName": "string",
    "projectLocationName": "string"
  },
  "satDroneSection": {...},
  "locationSection": {...},
  "internalSection": {...},
  "dockingSection": {...},
  "complianceSection": {...}
}
```

**Response:** 201 Created or 400 Bad Request (with validation errors)

### PUT /api/composition/:id
Replace entire composition. Validates against CompositionProps schema.

**Response:** 200 OK or 404 Not Found

### PATCH /api/composition/:id
Partial update with deep merge. Does not validate - allows partial updates.

**Request Body:** Any subset of composition fields
```json
{
  "intro": {
    "clientName": "Updated Name"
  }
}
```

**Response:** 200 OK or 404 Not Found

### DELETE /api/composition/:id
Delete a composition.

**Response:** 200 OK with message or 404 Not Found

## Testing Results

✅ All endpoints tested and working:
- GET with pagination and sorting
- POST with validation
- PUT with full replacement
- PATCH with deep merge (preserves unmodified fields)
- DELETE with proper cleanup
- Error handling (400, 404, 500)

## R2 Media Upload Integration

### Additional Endpoints

**POST /api/r2/presigned-url** - Get single presigned upload URL
**POST /api/r2/presigned-urls/batch** - Get multiple presigned URLs
**POST /api/composition/:id/media-urls** - Update media URLs after upload

### Upload Workflow

1. Create composition with empty/placeholder media URLs
2. Request presigned URLs for files to upload
3. Upload files directly to R2 using presigned URLs (client-side)
4. Update composition with public R2 URLs

See `r2-upload-workflow.md` and `r2-example-workflow.sh` for detailed documentation.

### Configuration Required

Add to `.env`:
```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=warehouse-videos
R2_PUBLIC_URL=https://your-bucket.r2.dev
```
