import { VideoDisplay } from "../VideoDisplay";

export const InternalDock: React.FC<any> = (props) => {
  return (
    <VideoDisplay
      videoUrl={props.videoUrl}
      audioUrl={props.audio.audioUrl}
      transcript={props.audio.transcript}
      placeholderText="Internal Dock - No Video Uploaded"
      startPaddingInSeconds={props.startPaddingInSeconds}
    />
  );
};
