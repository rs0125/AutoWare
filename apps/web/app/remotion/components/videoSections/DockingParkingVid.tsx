import { ExternalDockingSchema } from "@repo/shared";
import { z } from "zod";
import { VideoDisplay } from "../VideoDisplay";

export const DockingParkingVid: React.FC<z.infer<typeof ExternalDockingSchema> & { startPaddingInSeconds?: number }> = (props) => {
  return (
    <VideoDisplay
      videoUrl={props.dockPanVideoUrl}
      audioUrl={props.audio.audioUrl}
      transcript={props.audio.transcript}
      placeholderText="Docking Section - No Dock Video"
      startPaddingInSeconds={props.startPaddingInSeconds}
    />
  );
};
