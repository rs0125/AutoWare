# Implementation Plan

## Task List

- [x] 1. Create TranscriptInput component with Generate Speech button
  - Create `apps/web/app/components/TranscriptInput.tsx` with textarea element
  - Style textarea consistently with existing Input component
  - Add "Generate Speech" button with conditional rendering (show when no audio or transcript changed)
  - Implement change detection logic (compare with original transcript)
  - Add audio duration display below textarea (format: "Audio length: X.X seconds")
  - Add loading state during generation ("Generating..." text on button)
  - Store original transcript when component mounts with existing audio
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 3.1, 3.2, 3.3, 3.4_

- [x] 2. Implement TTS generation handler in editor
  - Add `handleGenerateSpeech` function in `apps/web/app/routes/editor.$id.tsx`
  - Call `generateAudioFromText` API function
  - Update form with audio URL and duration
  - Show success/error toast notifications
  - Handle loading states
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 6.5, 7.1, 7.2_

- [x] 3. Update SchemaFormGenerator to use TranscriptInput
  - Detect transcript fields in schema (key === "transcript")
  - Render TranscriptInput component for transcript fields instead of regular Input
  - Pass compositionId and onGenerateSpeech handler as props
  - Pass audioUrl from sibling field (e.g., `audio.audioUrl`)
  - Pass audioDuration from sibling field (e.g., `audio.durationInSeconds`)
  - Calculate field paths correctly for nested objects (e.g., "satDroneSection.audio.transcript")
  - Import and use TranscriptInput in renderField function
  - _Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 4. Implement section duration calculation logic
  - Create `calculateSectionDuration` utility function
  - Calculate minimum duration (audio + 1 second buffer)
  - Calculate start and end padding
  - Handle cases where no audio exists
  - Export function for use in editor and video components
  - _Requirements: 4.1, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Add duration validation to form
  - Add validation rule for section duration fields
  - Check duration against minimum (audio duration + 1s)
  - Display validation error message with minimum duration
  - Prevent form submission if validation fails
  - Update validation when audio duration changes
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 6. Update video duration calculation in editor
  - Modify `calculateDuration` function to use actual audio durations
  - Include padding in section duration calculations
  - Recalculate when any audio duration changes
  - Update Player component with new duration
  - _Requirements: 5.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 7. Implement audio playback in video sections
  - Update SatDrone component to play audio with padding
  - Update LocationVid component to play audio with padding
  - Update InternalVid component to play audio with padding
  - Update DockingParkingVid component to play audio with padding
  - Update CompliancesVid component to play audio with padding
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Add audio playback timing logic to video components
  - Calculate audio start time based on start padding
  - Use Remotion's Audio component with proper timing
  - Ensure audio plays for full duration
  - Handle cases where no audio exists
  - Test audio synchronization with visuals
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Implement transcript change tracking
  - Store original transcript when loading project
  - Compare current transcript with original on change
  - Mark transcript as changed if different
  - Reset change flag after successful generation
  - Handle whitespace and formatting differences
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Update form persistence logic
  - Ensure audio URLs are saved with project
  - Ensure audio durations are saved with project
  - Load transcripts, audio URLs, and durations on project load
  - Mark transcripts as unchanged when loading existing audio
  - Test save/load cycle for all sections
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Add loading overlay for TTS generation
  - Show LoadingOverlay component during generation
  - Display message "Generating speech..."
  - Block user interaction during generation
  - Hide overlay on success or error
  - _Requirements: 2.2_

- [x] 12. Add TTS API function to frontend API client
  - Add `generateAudioFromText` function to `apps/web/app/lib/api.ts`
  - Use existing backend endpoint `POST /api/tts/generate-audio`
  - Add proper TypeScript types for request and response
  - Handle network errors gracefully
  - Add timeout handling for long-running requests (TTS can take 5-15 seconds)
  - _Requirements: 2.1, 2.5_

- [ ]* 13. Add unit tests for TranscriptInput component
  - Test button visibility logic
  - Test change detection
  - Test audio duration display
  - Test loading states
  - Test error handling

- [ ]* 14. Add unit tests for duration calculation
  - Test minimum duration calculation
  - Test padding calculation
  - Test edge cases (zero duration, very long audio)
  - Test validation logic

- [ ]* 15. Add integration tests for TTS flow
  - Test end-to-end TTS generation
  - Test form update after generation
  - Test error handling
  - Test multiple section generation

- [ ]* 16. Add integration tests for video playback
  - Test audio timing in video sections
  - Test padding application
  - Test silent sections
  - Test total duration calculation

- [ ] 17. Update documentation
  - Document TranscriptInput component usage
  - Document TTS API integration
  - Document duration calculation logic
  - Add examples for common use cases
  - _Requirements: All_
