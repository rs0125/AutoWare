import { ComplianceSchema } from "@repo/shared";
import { z } from "zod";
import { VideoDisplay } from "../VideoDisplay";

export const CompliancesVid: React.FC<z.infer<typeof ComplianceSchema> & { startPaddingInSeconds?: number }> = (props) => {
  return (
    <VideoDisplay
      videoUrl={props.fireSafetyVideoUrl}
      audioUrl={props.audio.audioUrl}
      transcript={props.audio.transcript}
      placeholderText="Compliance Section - No Fire Safety Video"
      startPaddingInSeconds={props.startPaddingInSeconds}
    />
  );
};
