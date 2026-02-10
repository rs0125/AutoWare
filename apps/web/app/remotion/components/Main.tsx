import { Sequence } from "remotion";
import { Intro } from "./videoSections/Intro";
import { Outro } from "./videoSections/Outro";
import { SatDrone } from "./videoSections/SatDrone";
import { LocationVid } from "./videoSections/Location";
import { InternalVid } from "./videoSections/InternalVid";
import { DockingParkingVid } from "./videoSections/DockingParkingVid";
import { CompliancesVid } from "./videoSections/CompliancesVid";

import { WarehouseVideoProps } from "@repo/shared";

export const Main: React.FC<WarehouseVideoProps> = (props) => {
  const fps = 30;

  // Debug: Check if props are being passed
  console.log("Main component props:", props);
  console.log("Props meta:", props?.intro);

  // Fallback if props are undefined
  if (!props || !props.intro) {
    return (
      <div style={{ color: 'red', padding: 20 }}>
        ERROR: Props not passed correctly. Props: {JSON.stringify(props)}
      </div>
    );
  }

  const introDuration = 5 * fps;
  const satDroneDuration = (props.satDroneSection.audio.durationInSeconds || 5) * fps;
  const locationDuration = (props.locationSection.audio.durationInSeconds || 10) * fps;
  const internalDuration = (props.internalSection.audio.durationInSeconds || 15) * fps;
  const dockingDuration = (props.dockingSection.audio.durationInSeconds || 10) * fps;
  const complianceDuration = (props.complianceSection.audio.durationInSeconds || 10) * fps;
  const outroDuration = 5 * fps;

  const satDroneStart = introDuration;
  const locationStart = satDroneStart + satDroneDuration;
  const internalStart = locationStart + locationDuration;
  const dockingStart = internalStart + internalDuration;
  const complianceStart = dockingStart + dockingDuration;
  const outroStart = complianceStart + complianceDuration;

  return (
    <>
      {/* First Video Intro*/}
      <Sequence from={0} durationInFrames={introDuration}>
        <Intro clientname={props.intro.clientName} region={props.intro.projectLocationName} />
      </Sequence>

      {/* Second Video SatDrone */}
      <Sequence from={satDroneStart} durationInFrames={satDroneDuration}>
        <SatDrone
          dronevideourl={props.satDroneSection.droneVideoUrl || "Test"}
          satimageurl="Test"
          latitude={props.satDroneSection.location.lat}
          longitude={props.satDroneSection.location.lng}
        />
      </Sequence>

      {/* Third Video Location*/}
      <Sequence from={locationStart} durationInFrames={locationDuration}>
        <LocationVid {...props.locationSection} />
      </Sequence>

      {/* Fourth Video  Internal*/}
      <Sequence from={internalStart} durationInFrames={internalDuration}>
        <InternalVid {...props.internalSection} />
      </Sequence>

      {/* Fifth Video Docking & parking*/}
      <Sequence from={dockingStart} durationInFrames={dockingDuration}>
        <DockingParkingVid {...props.dockingSection} />
      </Sequence>

      {/* Sixth Video Compliances */}
      <Sequence from={complianceStart} durationInFrames={complianceDuration}>
        <CompliancesVid {...props.complianceSection} />
      </Sequence>

      {/*  Seventh Video (Outro) */}
      <Sequence from={outroStart} durationInFrames={outroDuration}>
        <Outro />
      </Sequence>
    </>
  );
};
