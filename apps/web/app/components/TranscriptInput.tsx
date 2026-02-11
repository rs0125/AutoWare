import { useEffect, useState, useRef } from "react";
import { Button } from "./Button";
import { Play, Pause } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  // Calculate minimum duration (audio + 1 second buffer)
  const minimumDuration = audioDuration ? (audioDuration + 1.0).toFixed(1) : null;

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
        <div className="flex flex-col gap-2">
          {audioUrl && (
            <Button
              type="button"
              onClick={handlePlayPause}
              variant="secondary"
              disabled={!audioUrl}
              className="whitespace-nowrap"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </>
              )}
            </Button>
          )}
          {showGenerateButton && (
            <Button
              type="button"
              onClick={handleGenerateSpeech}
              disabled={isGenerating || !value.trim()}
              loading={isGenerating}
              variant="outline"
            >
              {isGenerating ? "Generating..." : "Generate Speech"}
            </Button>
          )}
        </div>
      </div>
      {audioUrl && audioDuration ? (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Audio: {audioDuration.toFixed(1)}s</span>
          {minimumDuration && (
            <span>Minimum section: {minimumDuration}s</span>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No audio added</p>
      )}
      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}
    </div>
  );
}
