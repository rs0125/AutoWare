import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface TransitionWrapperProps {
    children: React.ReactNode;
    transitionDuration?: number;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
    children,
    transitionDuration = 15
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const opacity = interpolate(
        frame,
        [0, transitionDuration, durationInFrames - transitionDuration, durationInFrames],
        [0, 1, 1, 0],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );

    return (
        <AbsoluteFill style={{ opacity }}>
            {children}
        </AbsoluteFill>
    );
};
