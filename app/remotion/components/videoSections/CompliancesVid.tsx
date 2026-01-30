import { AbsoluteFill, useCurrentFrame } from "remotion";

export const CompliancesVid = () => {
  const frame = useCurrentFrame();

  return (
    <>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontSize: 40,
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
          45-55 sec: Compliances: - Fire safety measures videos (hydrants,
          sprinklers, alarm system, pump room etc)
      </AbsoluteFill>
    </>
  );
};
