import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
    
    const resetCalendarSettingHandler = () => {
        persistenceManager.resetAllValues();
        Router.replace('/');
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>CalendPro Settings</DialogTitle>
            <div className='p-6'>
                This calendar app produces events with this profile name:
                <p className='bg-gray-100 p-2 rounded-md mt-2'>{appConstants.calendarEventProfileName}</p>
            </div>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={resetCalendarSettingHandler}>Reset</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CalendarSettings;