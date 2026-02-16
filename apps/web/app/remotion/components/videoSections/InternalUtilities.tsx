import { VideoDisplay } from "../VideoDisplay";

export const InternalUtilities: React.FC<any> = (props) => {
  return (
    <VideoDisplay
      videoUrl={props.videoUrl}
      audioUrl={props.audio.audioUrl}
      transcript={props.audio.transcript}
      placeholderText="Internal Utilities - No Video Uploaded"
      startPaddingInSeconds={props.startPaddingInSeconds}
    />
  );
};
