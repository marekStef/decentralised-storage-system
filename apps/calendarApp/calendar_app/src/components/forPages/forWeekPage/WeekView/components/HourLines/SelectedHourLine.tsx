import { colors } from "@/constants/colors";
import { timeConstants } from "@/constants/timeConstants";
import React from "react";

interface SelectedHourLineParams {
    topOffset: number,
    leftOffset: number,
    heightInPixels: number,
    widthInPixels: number,
    selectedStartTime: object,
    durationTime: number
}

const SelectedHourLine: React.FC<SelectedHourLineParams> = ({ topOffset, leftOffset, heightInPixels, widthInPixels, selectedStartTime, durationTime }) => (
    <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
    }}>
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
                <p style={{ fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>New Event</p>

                <p style={{ fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center' }}>

                    {selectedStartTime.hour}: {(selectedStartTime.minute < 10 ? `0${selectedStartTime.minute}` : selectedStartTime.minute)}</p>

                <p style={{ fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center', fontWeight: 'bold' }}>duration </p>
                <p style={{ fontSize: '0.7rem', color: colors.green5, textWrap: 'wrap', textAlign: 'center' }}>
                    {Math.floor(durationTime / timeConstants.ONE_HOUR_IN_MINUTES)} <span>hours </span>
                    {durationTime % timeConstants.ONE_HOUR_IN_MINUTES} minutes</p>

            </div>
        </div>
    </div>
);

export default SelectedHourLine;