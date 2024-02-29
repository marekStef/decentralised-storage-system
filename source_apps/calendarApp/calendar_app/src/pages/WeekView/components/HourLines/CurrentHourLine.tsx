import React from "react";


// const CurrentHourLine = ({ topOffset, headerHeight }) => {
//     const currentDate = new Date();
//     const currentHour = currentDate.getHours();
//     const currentMinute = currentDate.getMinutes();
//     const hourHeight = calendarHeight / 24;
//     const topPosition = headerHeight + (currentHour + currentMinute / 60) * hourHeight;

//     return (
//         <div
//             style={{
//                 position: "absolute",
//                 top: `${topPosition}px`,
//                 left: 0,
//                 right: 0,
//                 borderTop: "2px solid red", // Make it more visible
//                 zIndex: 20, // Ensure it's above other items but below the sticky header
//             }}
//         />
//     );
// };

const CurrentHourLine = ({ position, leftOffset }) => (
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
                borderTop: "2px solid red",
                zIndex: 100,
            }}
        />
    </div>
);

export default CurrentHourLine;