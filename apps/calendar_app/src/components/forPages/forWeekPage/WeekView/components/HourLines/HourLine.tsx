import React from "react";

interface HourLineParams {
    position: number
}

const HourLine: React.FC<HourLineParams> = ({ position }) => (
    <div
        className="hour_line"
        style={{
            top: `${position}px`,
        }}
    />
);

export default HourLine;