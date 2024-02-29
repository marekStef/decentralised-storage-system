import React from "react";
import { colors } from "@/constants/colors";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

import "./WeekNavigationButtons.css";
import SelectedWeek from "@/data/SelectedWeek";

interface WeekNavigationButtonsParams {
    setSelectedWeek: (week: SelectedWeek | ((prevWeek: SelectedWeek) => SelectedWeek)) => void;
}


const WeekNavigationButtons: React.FC<WeekNavigationButtonsParams> = (params) => {
    const handlePreviousWeek = () => {
        params.setSelectedWeek(currWeek => currWeek.getPreviousWeek())
    };

    const handleNextWeek = () => {
        params.setSelectedWeek(currWeek => currWeek.getNextWeek())
    };

    return (
        
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                    onClick={handlePreviousWeek}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        padding: '0.4rem',
                        borderWidth: '1px',
                        borderColor: colors.gray2,
                        borderStyle: 'solid',
                    }}
                    className="hover:bg-slate-50"
                >
                    <IoChevronBackOutline size={24} />{" "}
                </button>
                <button
                    onClick={handleNextWeek}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        padding: '0.4rem',
                        borderWidth: '1px',
                        borderColor: colors.gray2,
                        borderStyle: 'solid',
                    }}
                    className="hover:bg-slate-50"
                >
                    <IoChevronForwardOutline size={24} />{" "}
                </button>
            </div>
    );
};

export default WeekNavigationButtons;
