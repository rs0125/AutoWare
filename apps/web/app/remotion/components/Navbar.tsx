import React from "react";
import { AbsoluteFill, staticFile } from "remotion";

export const Navbar: React.FC = () => {
    return (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-start", padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.9)", padding: "10px 20px", borderRadius: "30px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <img
                    src={staticFile("WOG_logo.png")}
                    alt="WareOnGo Logo"
                    style={{ height: 40, marginRight: 15 }}
                />
                <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#333", margin: 0, fontFamily: "sans-serif" }}>
                    WareOnGo
                </h1>
            </div>
        </AbsoluteFill>
    );
};
