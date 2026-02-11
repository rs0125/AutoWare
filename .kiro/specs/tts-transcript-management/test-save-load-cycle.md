# Manual Test: Save/Load Cycle for TTS Transcript Management

## Test Objective
Verify that audio URLs, durations, and transcripts are properly saved and loaded across the save/load cycle for all sections.

## Prerequisites
- Backend server running
- Frontend development server running
- At least one project created in the database

## Test Procedure

### Test 1: Load Existing Project with Audio
1. Navigate to a project that already has generated audio
2. Open the editor for that project
3. **Expected Results:**
   - All transcript fields display the saved transcript text
   - Audio duration is displayed below each transcript (e.g., "Audio length: 12.5 seconds")
   - "Generate Speech" button is NOT visible (transcript unchanged)
   - Video player shows correct total duration

### Test 2: Generate New Audio
1. Open a project in the editor
2. Modify a transcript in any section (e.g., satDroneSection)
3. **Expected Results:**
   - "Generate Speech" button appears next to the modified transcript
4. Click "Generate Speech"
5. **Expected Results:**
   - Button shows "Generating..." during generation
   - Success toast appears when complete
   - Audio duration is displayed below the transcript
   - "Generate Speech" button disappears
   - Video player duration updates

### Test 3: Save Project with Generated Audio
1. After generating audio (from Test 2), click "Save Project"
2. **Expected Results:**
   - Success toast: "Project saved"
   - No errors in console

### Test 4: Reload Project and Verify Persistence
1. Navigate away from the editor (back to projects list)
2. Open the same project again
3. **Expected Results:**
   - Transcript text is preserved
   - Audio URL is preserved (audio duration displayed)
   - "Generate Speech" button is NOT visible (transcript unchanged)
   - Video player shows correct duration

### Test 5: Modify Transcript After Load
1. With the project loaded (from Test 4), modify the transcript
2. **Expected Results:**
   - "Generate Speech" button appears
3. Modify the transcript back to the original text
4. **Expected Results:**
   - "Generate Speech" button disappears (change detection works)

### Test 6: Multiple Sections
1. Generate audio for multiple sections:
   - satDroneSection
   - locationSection
   - internalSection
   - dockingSection
   - complianceSection
2. Save the project
3. Reload the project
4. **Expected Results:**
   - All sections preserve their audio URLs and durations
   - All transcripts are unchanged
   - No "Generate Speech" buttons visible
   - Total video duration is correct

### Test 7: Whitespace Handling
1. Load a project with existing audio
2. Add extra spaces or newlines to a transcript (without changing words)
3. **Expected Results:**
   - "Generate Speech" button does NOT appear (whitespace normalized)
4. Change actual words in the transcript
5. **Expected Results:**
   - "Generate Speech" button appears

## Success Criteria
- ✅ All audio URLs are saved and loaded correctly
- ✅ All audio durations are saved and loaded correctly
- ✅ All transcripts are saved and loaded correctly
- ✅ Transcripts are marked as unchanged when loading existing audio
- ✅ Change detection works correctly (including whitespace normalization)
- ✅ Multiple sections work independently
- ✅ Video duration updates correctly based on audio durations

## Notes
- This test covers Requirements 7.1, 7.2, 7.3, 7.4, 7.5
- Backend automatically updates composition when `updateComposition: true` is set
- Frontend form properly handles nested field paths for audio data
