import React from "react";

const HourLine = ({ position }) => (
    <div
        className="hour_line"
        style={{
            top: `${position}px`,
        }}
    />
);

export default HourLine;