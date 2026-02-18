import { Sequence } from "remotion";
import { Intro } from "./videoSections/Intro";
import { Outro } from "./videoSections/Outro";
import { SatDrone } from "./videoSections/SatDrone";
import { LocationVid } from "./videoSections/Location";
import { ApproachRoad } from "./videoSections/ApproachRoad";
import { InternalWideShot } from "./videoSections/InternalWideShot";
import { InternalDock } from "./videoSections/InternalDock";
import { InternalUtilities } from "./videoSections/InternalUtilities";
import { DockingParkingVid } from "./videoSections/DockingParkingVid";
import { CompliancesVid } from "./videoSections/CompliancesVid";

import { WarehouseVideoProps } from "@repo/shared";

// Helper function to calculate section duration with padding
function calculateSectionDuration(
  audioDuration: number,
  userSetDuration?: number
) {
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

  const minimumDuration = audioDuration + 1.0;
  const actualDuration = Math.max(userSetDuration || minimumDuration, minimumDuration);
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

import { TransitionWrapper } from "./TransitionWrapper";

export const Main: React.FC<WarehouseVideoProps> = (props) => {
  const fps = 30;
  const TRANSITION_DURATION = 15; // 0.5s overlap

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

  // Calculate section durations with padding
  const satDroneCalc = calculateSectionDuration(
    props.satDroneSection.audio.durationInSeconds || 0,
    props.satDroneSection.sectionDurationInSeconds
  );

  const locationCalc = calculateSectionDuration(
    props.locationSection.audio.durationInSeconds || 0,
    props.locationSection.sectionDurationInSeconds
  );

  const approachRoadCalc = calculateSectionDuration(
    props.approachRoadSection.audio.durationInSeconds || 0,
    props.approachRoadSection.sectionDurationInSeconds
  );

  // Three separate internal sections
  const internalWideShotCalc = calculateSectionDuration(
    props.internalWideShotSection.audio.durationInSeconds || 0,
    props.internalWideShotSection.sectionDurationInSeconds
  );
  const internalDockCalc = calculateSectionDuration(
    props.internalDockSection.audio.durationInSeconds || 0,
    props.internalDockSection.sectionDurationInSeconds
  );
  const internalUtilitiesCalc = calculateSectionDuration(
    props.internalUtilitiesSection.audio.durationInSeconds || 0,
    props.internalUtilitiesSection.sectionDurationInSeconds
  );

  const dockingCalc = calculateSectionDuration(
    props.dockingSection.audio.durationInSeconds || 0,
    props.dockingSection.sectionDurationInSeconds
  );
  const complianceCalc = calculateSectionDuration(
    props.complianceSection.audio.durationInSeconds || 0,
    props.complianceSection.sectionDurationInSeconds
  );

  const satDroneDuration = satDroneCalc.actualDuration * fps;
  const locationDuration = locationCalc.actualDuration * fps;
  const approachRoadDuration = approachRoadCalc.actualDuration * fps;
  const internalWideShotDuration = internalWideShotCalc.actualDuration * fps;
  const internalDockDuration = internalDockCalc.actualDuration * fps;
  const internalUtilitiesDuration = internalUtilitiesCalc.actualDuration * fps;
  const dockingDuration = dockingCalc.actualDuration * fps;
  const complianceDuration = complianceCalc.actualDuration * fps;
  const outroDuration = 5 * fps;

  // Calculate start times with overlap
  const satDroneStart = introDuration - TRANSITION_DURATION;
  const locationStart = satDroneStart + satDroneDuration - TRANSITION_DURATION;
  const approachRoadStart = locationStart + locationDuration - TRANSITION_DURATION;
  const internalWideShotStart = approachRoadStart + approachRoadDuration - TRANSITION_DURATION;
  const internalDockStart = internalWideShotStart + internalWideShotDuration - TRANSITION_DURATION;
  const internalUtilitiesStart = internalDockStart + internalDockDuration - TRANSITION_DURATION;
  const dockingStart = internalUtilitiesStart + internalUtilitiesDuration - TRANSITION_DURATION;
  const complianceStart = dockingStart + dockingDuration - TRANSITION_DURATION;
  const outroStart = complianceStart + complianceDuration - TRANSITION_DURATION;

  // Calculate total duration (should end after outro)
  // Note: We don't subtract transition duration here because the last frame plays out fully
  const totalDuration = outroStart + outroDuration;

  console.log("Total video duration:", totalDuration, "frames (", totalDuration / fps, "seconds)");

  return (
    <>
      {/* First Video Intro*/}
      <Sequence from={0} durationInFrames={introDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <Intro clientname={props.intro.clientName} region={props.intro.projectLocationName} />
        </TransitionWrapper>
      </Sequence>

      {/* Second Video SatDrone */}
      <Sequence from={satDroneStart} durationInFrames={satDroneDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <SatDrone
            dronevideourl={props.satDroneSection.droneVideoUrl || "Test"}
            satimageurl={props.satDroneSection.satelliteImageUrl}
            latitude={props.satDroneSection.location.lat}
            longitude={props.satDroneSection.location.lng}
            audio={props.satDroneSection.audio}
            startPaddingInSeconds={satDroneCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Third Video Location*/}
      <Sequence from={locationStart} durationInFrames={locationDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <LocationVid
            {...props.locationSection}
            satelliteImageUrl={props.satDroneSection.satelliteImageUrl}
            startPaddingInSeconds={locationCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Fourth Video - Approach Road */}
      <Sequence from={approachRoadStart} durationInFrames={approachRoadDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <ApproachRoad
            {...props.approachRoadSection}
            startPaddingInSeconds={approachRoadCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Fifth Video - Internal Wide Shot */}
      <Sequence from={internalWideShotStart} durationInFrames={internalWideShotDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <InternalWideShot
            {...props.internalWideShotSection}
            startPaddingInSeconds={internalWideShotCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Sixth Video - Internal Dock */}
      <Sequence from={internalDockStart} durationInFrames={internalDockDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <InternalDock
            {...props.internalDockSection}
            startPaddingInSeconds={internalDockCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Seventh Video - Internal Utilities */}
      <Sequence from={internalUtilitiesStart} durationInFrames={internalUtilitiesDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <InternalUtilities
            {...props.internalUtilitiesSection}
            startPaddingInSeconds={internalUtilitiesCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Eighth Video Docking & parking*/}
      <Sequence from={dockingStart} durationInFrames={dockingDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <DockingParkingVid
            {...props.dockingSection}
            startPaddingInSeconds={dockingCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Ninth Video Compliances */}
      <Sequence from={complianceStart} durationInFrames={complianceDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <CompliancesVid
            {...props.complianceSection}
            startPaddingInSeconds={complianceCalc.startPadding}
          />
        </TransitionWrapper>
      </Sequence>

      {/* Tenth Video (Outro) */}
      <Sequence from={outroStart} durationInFrames={outroDuration}>
        <TransitionWrapper transitionDuration={TRANSITION_DURATION}>
          <Outro />
        </TransitionWrapper>
      </Sequence>
    </>
  );
};
