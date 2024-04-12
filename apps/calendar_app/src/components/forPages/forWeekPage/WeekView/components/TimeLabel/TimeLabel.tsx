import React from "react";

const TimeLabel = ({ index, calendarHeight, headerHeight, calendarLeftColumnHoursWidthInPixels }) => {
    const slotHeight = calendarHeight / 24
    return (
        <div
            key={index}
            style={{
                height: `${slotHeight}px`,
                position: "absolute",
                top: `${headerHeight + index * (slotHeight) - slotHeight / 2.7}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                width: `${calendarLeftColumnHoursWidthInPixels}px`
            }}
        >
            {index}:00
        </div>
    )
};

export default TimeLabel;