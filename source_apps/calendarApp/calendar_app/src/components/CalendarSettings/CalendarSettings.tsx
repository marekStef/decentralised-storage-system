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

interface CalendarSetttingsParams {
    open: boolean,
    handleClose: () => void,
}

const CalendarSettings: React.FC<CalendarSetttingsParams> = ({ open, handleClose }) => {
    const Router = useRouter();
    
    const resetCalendarSettingHandler = () => {
        localStorage.removeItem('calendarSetupComplete')
        Router.replace('/');
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>CalendPro Settings</DialogTitle>
            <DialogContent>
                
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={resetCalendarSettingHandler}>Reset</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CalendarSettings;