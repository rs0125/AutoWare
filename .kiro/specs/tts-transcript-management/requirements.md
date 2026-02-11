# Requirements Document

## Introduction

This feature enables users to generate audio from transcript text using the existing OpenAI Text-to-Speech backend API, with intelligent transcript change detection and dynamic video duration management based on audio lengths. The backend API and Zod schemas are already implemented.

## Glossary

- **TTS (Text-to-Speech)**: AI-powered service that converts written text into spoken audio
- **Transcript**: Written text that will be converted to speech audio
- **Audio Duration**: Length of generated audio file in seconds
- **Section Duration**: Total length of a video section including padding
- **Buffer/Padding**: Extra time added before and after audio playback
- **Field Path**: Dot-notation path to a field in the data structure (e.g., "satDroneSection.audio.transcript")

## Requirements

### Requirement 1: Generate Speech Button Visibility

**User Story:** As a video editor, I want to see a "Generate Speech" button next to transcript fields when I need to generate audio, so that I can easily create voiceovers for my video sections.

#### Acceptance Criteria

1. WHEN a transcript field has no associated audio URL, THE System SHALL display a "Generate Speech" button next to the transcript input
2. WHEN a transcript text is modified after audio has been generated, THE System SHALL display a "Generate Speech" button next to the transcript input
3. WHEN a transcript has associated audio AND the text has not changed, THE System SHALL NOT display the "Generate Speech" button
4. WHERE the button is displayed, THE System SHALL position it adjacent to the transcript input field similar to the Google Maps confirm button

### Requirement 2: TTS Audio Generation

**User Story:** As a video editor, I want to generate audio from transcript text by clicking a button, so that I can quickly create voiceovers without manual recording.

#### Acceptance Criteria

1. WHEN the user clicks the "Generate Speech" button, THE System SHALL call the TTS API with the transcript text and field path
2. WHILE audio generation is in progress, THE System SHALL display a loading state on the button with text "Generating..."
3. WHEN audio generation succeeds, THE System SHALL update the form with the audio URL and duration
4. WHEN audio generation succeeds, THE System SHALL display a success toast notification
5. IF audio generation fails, THEN THE System SHALL display an error toast notification with the failure reason
6. WHEN audio is generated, THE System SHALL hide the "Generate Speech" button until the transcript changes again

### Requirement 3: Audio Duration Display

**User Story:** As a video editor, I want to see the duration of generated audio, so that I understand how long each section will be.

#### Acceptance Criteria

1. WHEN audio has been generated for a section, THE System SHALL display the audio duration in grey text below the transcript field
2. THE System SHALL format the duration display as "Audio length: X.X seconds"
3. WHEN the audio duration changes, THE System SHALL update the displayed duration immediately
4. WHERE no audio exists, THE System SHALL NOT display any duration information

### Requirement 4: Section Duration Validation

**User Story:** As a video editor, I want the system to prevent me from setting section durations shorter than the audio length, so that audio doesn't get cut off.

#### Acceptance Criteria

1. THE System SHALL calculate minimum section duration as audio duration plus 1 second (0.5s buffer on each side)
2. WHEN a user attempts to set section duration below the minimum, THE System SHALL prevent the change
3. WHEN a user attempts to set section duration below the minimum, THE System SHALL display a validation error message
4. THE System SHALL display the minimum required duration in the validation message
5. WHEN audio duration changes, THE System SHALL automatically update the minimum section duration

### Requirement 5: Dynamic Section Duration Padding

**User Story:** As a video editor, I want extra time I add to a section to be distributed evenly before and after the audio, so that the audio is centered in the section.

#### Acceptance Criteria

1. WHEN section duration equals minimum duration, THE System SHALL apply 0.5 seconds padding before and after audio
2. WHEN section duration exceeds minimum duration by X seconds, THE System SHALL apply (X/2 + 0.5) seconds padding before audio
3. WHEN section duration exceeds minimum duration by X seconds, THE System SHALL apply (X/2 + 0.5) seconds padding after audio
4. THE System SHALL recalculate padding whenever section duration or audio duration changes
5. THE System SHALL use the calculated padding in video composition playback

### Requirement 6: Transcript Change Detection

**User Story:** As a video editor, I want the system to detect when I've changed a transcript, so that I can regenerate audio when needed.

#### Acceptance Criteria

1. WHEN a transcript field is loaded with existing audio, THE System SHALL store the original transcript text
2. WHEN the user modifies the transcript text, THE System SHALL compare it to the original text
3. IF the transcript text differs from the original, THEN THE System SHALL mark the transcript as changed
4. WHEN a transcript is marked as changed, THE System SHALL display the "Generate Speech" button
5. WHEN audio is regenerated, THE System SHALL update the stored original transcript text

### Requirement 7: Form Integration and Persistence

**User Story:** As a video editor, I want generated audio to be saved with my project, so that I don't lose my voiceovers.

#### Acceptance Criteria

1. WHEN the user clicks "Save Project", THE System SHALL include all audio URLs in the saved data
2. WHEN the user clicks "Save Project", THE System SHALL include all audio durations in the saved data
3. WHEN a project is loaded, THE System SHALL populate transcript fields with saved text
4. WHEN a project is loaded, THE System SHALL populate audio URLs and durations
5. THE System SHALL mark transcripts as unchanged when loading existing audio

### Requirement 8: Video Composition Audio Playback

**User Story:** As a video editor, I want to hear the generated audio when previewing my video, so that I can verify the voiceover quality and timing.

#### Acceptance Criteria

1. WHEN a video section plays, THE System SHALL play the associated audio file if it exists
2. THE System SHALL start audio playback after the calculated start padding
3. THE System SHALL ensure audio plays for its full duration
4. THE System SHALL apply the calculated end padding after audio completes
5. WHEN no audio exists for a section, THE System SHALL play the section silently

### Requirement 9: Multiple Section Support

**User Story:** As a video editor, I want to generate audio for multiple sections independently, so that each section has its own voiceover.

#### Acceptance Criteria

1. THE System SHALL support independent audio generation for satDroneSection
2. THE System SHALL support independent audio generation for locationSection
3. THE System SHALL support independent audio generation for internalSection
4. THE System SHALL support independent audio generation for dockingSection
5. THE System SHALL support independent audio generation for complianceSection
6. WHEN generating audio for one section, THE System SHALL NOT affect audio in other sections

### Requirement 10: Total Video Duration Calculation

**User Story:** As a video editor, I want the total video duration to automatically adjust based on audio lengths, so that the video ends at the right time.

#### Acceptance Criteria

1. THE System SHALL calculate total video duration as sum of all section durations
2. WHEN any audio duration changes, THE System SHALL recalculate total video duration
3. THE System SHALL include intro duration (5 seconds) in total calculation
4. THE System SHALL include outro duration (5 seconds) in total calculation
5. THE System SHALL update the video player duration immediately when total duration changes
