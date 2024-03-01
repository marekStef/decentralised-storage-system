import React, {useState, useEffect } from 'react';
import './NewEventDialog.css';
import { DayOfWeek } from '@/data/SelectedWeek';

export interface NewEventDialogData {
    day: DayOfWeek, 
    hour: number, 
    minute: number
}

interface NewEventDialogParams {
    data: NewEventDialogData | null;
    onClose: () => void;
}

const NewEventDialog: React.FC<NewEventDialogParams> = (params) => {
        useEffect(() => {
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    params.onClose();
                }
            };
    
            if (params.data) {
                window.addEventListener("keydown", handleEsc);
            }
    
            return () => {
                window.removeEventListener("keydown", handleEsc);
            };
        }, [params.data, params.onClose]);

        if (!params.data) return null;

        return (
            <div className="modal-overlay" onClick={params.onClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <header className="modal-header m-4">
                        <h1 className="text-xl text-gray-400">New Event</h1>
                        <button onClick={params.onClose} className="close-button">
                            <p className="text-gray-400 text-3xl">&times;</p>
                        </button>
                    </header>
    
                    <div className="flex w-full">
                        
                        <div className="w-full h-full m-4">
                            <h1>hello</h1>
                            <p>{params.data?.day.dayInUTC}</p>
                            <p>{params.data?.hour}:{params.data?.minute}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default NewEventDialog;