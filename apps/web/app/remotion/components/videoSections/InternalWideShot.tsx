import { VideoDisplay } from "../VideoDisplay";

export const InternalWideShot: React.FC<any> = (props) => {
  return (
    <VideoDisplay
      videoUrl={props.videoUrl}
      audioUrl={props.audio.audioUrl}
      transcript={props.audio.transcript}
      placeholderText="Internal Wide Shot - No Video Uploaded"
      startPaddingInSeconds={props.startPaddingInSeconds}
    />
  );
};
