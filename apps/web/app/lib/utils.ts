import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SectionDuration {
  audioDuration: number;
  minimumDuration: number;
  actualDuration: number;
  startPadding: number;
  endPadding: number;
}

/**
 * Calculate section duration with padding based on audio length
 * @param audioDuration - Duration of the audio in seconds (0 if no audio)
 * @param userSetDuration - Optional user-specified duration in seconds
 * @returns SectionDuration object with calculated values
 */
export function calculateSectionDuration(
  audioDuration: number,
  userSetDuration?: number
): SectionDuration {
  // Handle case where no audio exists
  if (!audioDuration || audioDuration <= 0) {
    const duration = userSetDuration || 0;
    return {
      audioDuration: 0,
      minimumDuration: 0,
      actualDuration: duration,
      startPadding: 0,
      endPadding: 0,
    };
  }

  // Calculate minimum duration (audio + 1 second buffer: 0.5s each side)
  const minimumDuration = audioDuration + 1.0;
  
  // Actual duration is the greater of user-set or minimum
  const actualDuration = Math.max(userSetDuration || minimumDuration, minimumDuration);
  
  // Calculate padding (extra time distributed evenly)
  const extraTime = actualDuration - audioDuration;
  const padding = extraTime / 2;
  
  return {
    audioDuration,
    minimumDuration,
    actualDuration,
    startPadding: padding,
    endPadding: padding,
  };
}
