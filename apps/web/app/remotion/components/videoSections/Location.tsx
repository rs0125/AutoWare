import { LocationHighlightSchema } from "@repo/shared";
import { z } from "zod";
import { VideoDisplay } from "../VideoDisplay";

export const LocationVid: React.FC<z.infer<typeof LocationHighlightSchema>> = (props) => {
  return (
    <VideoDisplay
      videoUrl={props.approachRoadVideoUrl}
      audioUrl={props.audio.audioUrl}
      transcript={props.audio.transcript}
      placeholderText="Location Section - No Approach Road Video"
    />
  );
};
