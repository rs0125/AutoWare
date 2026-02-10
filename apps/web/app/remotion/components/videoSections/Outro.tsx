import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Outro = () => {
  const frame = useCurrentFrame();

  return (
    <>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: "#374151" }}>
          <p style={{ fontSize: 32, marginBottom: 20 }}>
            For more details regarding these warehouses (or) to schedule site visits, please contact –
          </p>
          <p style={{ fontSize: 40, fontWeight: "bold", color: "#0284c7" }}>
            Dhaval Gupta <span style={{ color: "#374151", margin: "0 10px" }}>|</span> +91 83188 25478
          </p>
        </div>
      </AbsoluteFill>
    </>
  );
};
