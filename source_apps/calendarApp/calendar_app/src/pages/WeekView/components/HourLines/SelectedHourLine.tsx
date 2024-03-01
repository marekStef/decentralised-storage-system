import { colors } from "@/constants/colors";
import React from "react";

interface SelectedHourLineParams {
    topOffset: number,
    leftOffset: number,
    heightInPixels: number,
    widthInPixels: number
}

const SelectedHourLine: React.FC<SelectedHourLineParams> = ({ topOffset, leftOffset, heightInPixels, widthInPixels }) => (
    <div
        style={{
            position: "absolute",
            top: `${topOffset}px`,
            left: `${leftOffset}px`,
            right: 0,
            zIndex: 100,
        }}
    >
        <div
            style={{
                position: "absolute",
                width: widthInPixels,
                height: `${heightInPixels}px`,
                backgroundColor: colors.transparentLightGreen,
                border: `1px solid ${colors.transparentLightGreenDarker}`,
                borderRadius: '0.2rem',
            }}
        >
            <p style={{fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center'}}>New Event</p>

            <p style={{fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center'}}>{topOffset}</p>
            <p style={{fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center'}}>-</p>
            <p style={{fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center'}}>{heightInPixels}</p>
        </div>
    </div>
);

export default SelectedHourLine;