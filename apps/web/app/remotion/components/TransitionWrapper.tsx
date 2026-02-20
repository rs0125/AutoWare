import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface TransitionWrapperProps {
    children: React.ReactNode;
    transitionDuration?: number;
    sequenceDuration: number;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
    children,
    transitionDuration = 15,
    sequenceDuration
}) => {
    const frame = useCurrentFrame();

    const opacity = interpolate(
        frame,
        [0, transitionDuration],
        [0, 1],
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
