import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogActions, Button, Switch, FormControlLabel } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/cs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { addMinutes } from 'date-fns';
import { timeConstants } from '@/constants/timeConstants';
import { useRouter } from 'next/router';
import persistenceManager from '@/data/PersistenceManager';


import appConstants from '../../constants/appConstants';

interface CalendarSetttingsParams {
    open: boolean,
    handleClose: () => void,
}

const CalendarSettings: React.FC<CalendarSetttingsParams> = ({ open, handleClose }) => {
    const Router = useRouter();
    const [isViewInstanceUsed, setIsViewInstanceUsed] = useState(persistenceManager.getIsViewInstanceUsedForCalendarFetching());

    const resetCalendarSettingHandler = () => {
        persistenceManager.resetAllValues();
        Router.replace('/');
    }

    const toggleViewInstance = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isUsed = event.target.checked;
        persistenceManager.setIsViewInstanceUsedForCalendarFetching(isUsed);
        setIsViewInstanceUsed(isUsed);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>CalendPro Settings</DialogTitle>
            <div className='p-6'>
                <div className='border border-gray-500 p-4 rounded-md'>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isViewInstanceUsed}
                                onChange={toggleViewInstance}
                            />
                        }
                        label="Enable Fetching Events Using View Instance"
                    />
                    <p className='text-gray-400 font-thin'>You can choose whether to use View Instance ( this is very effective as only the visible events are fetched from the dataStorage using custom javascript code) or whether to load all events from dataStorage and process them here in browser. This only highlights the dataStorage Views feature and in real life scenario, View Instance would be used by default</p>

                </div>

                <hr className="mt-10 h-px mb-2 bg-gray-200 border-0" />

                <p className='text-gray-400 font-thin'>This calendar app produces events with this profile name:</p>
                <p className='bg-gray-100 text-gray-500 font-thin p-2 rounded-md my-2'>{appConstants.calendarEventProfileName}</p>
            </div>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={resetCalendarSettingHandler}>Reset</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CalendarSettings;