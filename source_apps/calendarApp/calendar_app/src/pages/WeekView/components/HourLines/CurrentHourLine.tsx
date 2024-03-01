import React from "react";

interface CurrentHourLineParams {
    position: number,
    leftOffset: number,
    heightInPixels: number
}

const CurrentHourLine : React.FC<CurrentHourLineParams> = ({ position, leftOffset, heightInPixels = 2 }) => (
    <div
        style={{
            position: "absolute",
            top: `${position}px`,
            left: `${leftOffset - 5}px`,
            right: 0,
            zIndex: 10,
        }}
    >
        <div
            style={{
                position: "absolute",
                top: "-5px",
                left: "0",
                width: "12px",
                height: "12px",
                backgroundColor: "red",
                borderRadius: "50%",
            }}
        />
        <div
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                borderTop: `${heightInPixels}px solid red`,
                zIndex: 100,
            }}
        />
    </div>
);

export default CurrentHourLine;