import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { satdroneModel } from "~/remotion/models/satdrone";

export const SatDrone: React.FC<satdroneModel> = ({ latitude, longitude, dronevideourl }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Generate Google Maps Static API URL for satellite imagery
  // Note: In production, you should use a proper API key
  const satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=17&size=1920x1080&maptype=satellite&key=YOUR_API_KEY`;

  // Interpolate zoom from 0.5x to 1x over the duration of the section
  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [0.5, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <>
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          overflow: "hidden",
        }}
      >
        {/* Satellite Image with Zoom Animation */}
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={satelliteImageUrl}
            alt="Satellite view"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          />
        </AbsoluteFill>

        {/* Optional: Drone video overlay if provided */}
        {dronevideourl && (
          <AbsoluteFill
            style={{
              opacity: interpolate(
                frame,
                [durationInFrames * 0.7, durationInFrames],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }
              ),
            }}
          >
            {/* Drone video would go here */}
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </>
  );
};
