import { useEffect, useState } from "react";
import { Button } from "./Button";

interface TranscriptInputProps {
  value?: string;
  onChange: (value: string) => void;
  audioUrl?: string;
  audioDuration?: number;
  onGenerateSpeech?: (transcript: string, fieldPath: string) => Promise<void>;
  fieldPath: string;
  label?: string;
  compositionId?: string;
  disabled?: boolean;
}

export function TranscriptInput({
  value = "",
  onChange,
  audioUrl,
  audioDuration,
  onGenerateSpeech,
  fieldPath,
  label,
  compositionId,
  disabled = false,
}: TranscriptInputProps) {
  const [originalTranscript, setOriginalTranscript] = useState<string>("");
  const [hasChanged, setHasChanged] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | undefined>(undefined);

  // Normalize whitespace for comparison - trim and collapse multiple spaces
  const normalizeText = (text: string): string => {
    return text.trim().replace(/\s+/g, ' ');
  };

  // Store original transcript when loading project with existing audio
  // Reset when audioUrl changes (new audio generated or different project loaded)
  useEffect(() => {
    // If audioUrl changed (including from undefined to a value, or from one URL to another)
    if (audioUrl !== lastAudioUrl) {
      setLastAudioUrl(audioUrl);
      
      if (audioUrl && value) {
        // Audio exists, store the current transcript as original
        setOriginalTranscript(value);
        setHasChanged(false);
      } else if (!audioUrl) {
        // No audio, reset original transcript
        setOriginalTranscript("");
        setHasChanged(false);
      }
    }
  }, [audioUrl, value, lastAudioUrl]);

  // Compare current transcript with original on change
  // Mark transcript as changed if different (handling whitespace differences)
  useEffect(() => {
    const normalizedCurrent = normalizeText(value);
    const normalizedOriginal = normalizeText(originalTranscript);
    setHasChanged(normalizedCurrent !== normalizedOriginal && normalizedCurrent.length > 0);
  }, [value, originalTranscript]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleGenerateSpeech = async () => {
    if (!onGenerateSpeech || !value.trim() || !compositionId) return;

    try {
      setIsGenerating(true);
      await onGenerateSpeech(value, fieldPath);
      // Update original transcript after successful generation
      setOriginalTranscript(value);
      setHasChanged(false);
    } catch (error) {
      // Error handling is done by the parent component via toast
      console.error("Failed to generate speech:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Show button when: 
  // 1. No audio exists, OR
  // 2. Transcript has changed from original, OR
  // 3. Audio exists but transcript is empty (orphaned audio)
  const showGenerateButton = (
    (!audioUrl || hasChanged || (audioUrl && !value.trim())) && 
    onGenerateSpeech && 
    compositionId
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <textarea
          className="leading-[1.7] block w-full rounded-geist bg-background p-geist-half text-foreground text-sm border border-unfocused-border-color transition-colors duration-150 ease-in-out focus:border-focused-border-color outline-none resize-vertical min-h-[100px]"
          value={value}
          onChange={handleTextChange}
          disabled={disabled || isGenerating}
          placeholder="Enter transcript text..."
        />
        {showGenerateButton && (
          <Button
            type="button"
            onClick={handleGenerateSpeech}
            disabled={isGenerating || !value.trim()}
            loading={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Speech"}
          </Button>
        )}
      </div>
      {audioUrl && audioDuration && (
        <p className="text-xs text-gray-500">
          Audio length: {audioDuration.toFixed(1)} seconds
        </p>
      )}
    </div>
  );
}
