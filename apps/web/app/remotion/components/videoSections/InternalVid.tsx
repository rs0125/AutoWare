import { InternalStorageSchema } from "@repo/shared";
import { z } from "zod";
import { VideoDisplay } from "../VideoDisplay";

export const InternalVid: React.FC<z.infer<typeof InternalStorageSchema> & { startPaddingInSeconds?: number }> = (props) => {
  return (
    // Priority: wide shot > internal dock > first utility video
    <VideoDisplay
      videoUrl={props.wideShotVideoUrl || props.internalDockVideoUrl || props.utilities.videoUrl}
      audioUrl={props.audio.audioUrl}
      transcript={props.audio.transcript}
      placeholderText="Internal Section - No Videos Uploaded"
      startPaddingInSeconds={props.startPaddingInSeconds}
    />
  );
};
