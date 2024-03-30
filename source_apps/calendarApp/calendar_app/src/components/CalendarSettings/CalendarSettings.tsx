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
import { showInfo, showSuccess } from '../AlertProvider/AlertProvider';

interface CalendarSetttingsParams {
    open: boolean,
    handleClose: () => void,
}

const CalendarSettings: React.FC<CalendarSetttingsParams> = ({ open, handleClose }) => {
    const Router = useRouter();
    const [isViewInstanceUsed, setIsViewInstanceUsed] = useState(persistenceManager.getIsViewInstanceUsedForCalendarFetching());
    const [isOpenedWindowsAppsHistoryShown, setIsOpenedWindowsAppsHistoryShown] = useState(persistenceManager.getAreWindowsOpenedAppsShown());

    const [areAndroidLocationsShown, setAreAndroidLocationsShown] = useState(persistenceManager.getAreAndroidLocationsShown());

    const toggleViewInstance = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isUsed = event.target.checked;
        persistenceManager.setIsViewInstanceUsedForCalendarFetching(isUsed);
        setIsViewInstanceUsed(isUsed);
        showInfo("Reload the app to apply changes");
    }

    const toggleShowingWindowsOpenedApps = (event: React.ChangeEvent<HTMLInputElement>) => {
        const shown = event.target.checked;
        persistenceManager.setAreWindowsOpenedAppsShown(shown);
        setIsOpenedWindowsAppsHistoryShown(shown);
        showInfo("Reload the app to apply changes");
    }

    const toggleShowingAndroidLocations = (event: React.ChangeEvent<HTMLInputElement>) => {
        const shown = event.target.checked;
        persistenceManager.setAreAndroidLocationsShown(shown);
        setAreAndroidLocationsShown(shown);
        showInfo("Reload the app to apply changes");
    }

    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

    const resetCalendarSettingHandler = () => {
        setResetConfirmOpen(false);
        persistenceManager.resetAllValues();
        Router.replace('/');
    };

    const handleOpenResetConfirm = () => {
        setResetConfirmOpen(true);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>CalendPro Settings</DialogTitle>
            <div className='p-6'>
                <div className='border border-gray-300 p-4 rounded-md mb-5'>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isViewInstanceUsed}
                                onChange={toggleViewInstance}
                            />
                        }
                        label="Enable Fetching Events Using View Instance"
                    />
                    <p className='text-gray-400 font-thin'>
                        You can choose whether to use View Instance ( this is very effective as only the visible events are fetched from the dataStorage using custom javascript code)
                        or whether to load all events from dataStorage and process them here in browser.
                        This only highlights the dataStorage Views feature and in real life scenario, View Instance would be used by default
                    </p>

                </div>

                <div className='border border-gray-300 p-4 rounded-md mb-5'>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isOpenedWindowsAppsHistoryShown}
                                onChange={toggleShowingWindowsOpenedApps}
                            />
                        }
                        label="Enable Showing Windows Opened Apps"
                    />
                    <p className='text-gray-400 font-thin'>
                        Show Opened Windows Apps
                    </p>

                </div>

                <div className='border border-gray-300 p-4 rounded-md'>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={areAndroidLocationsShown}
                                onChange={toggleShowingAndroidLocations}
                            />
                        }
                        label="Enable Showing Location"
                    />
                    <p className='text-gray-400 font-thin'>
                        Show your location (if possible)
                    </p>

                </div>

                <hr className="mt-10 h-px mb-2 bg-gray-200 border-0" />

                <p className='text-gray-400 font-thin'>This calendar app produces events with this profile name:</p>
                <p className='bg-gray-100 text-gray-500 font-thin p-2 rounded-md my-2'>{appConstants.calendarEventProfileName}</p>


                <Button 
                    onClick={handleOpenResetConfirm} 
                    style={{ backgroundColor: 'red', color: 'white', marginTop: '10px', width: '100%' }}
                    variant="contained"
                >
                    Reset The Whole App
                </Button>

            </div>



            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>

            </DialogActions>
            <Dialog open={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)}>
                    <DialogTitle>Reset App</DialogTitle>
                    <div className='p-6'>
                        Are you sure you want to reset all settings for the whole app?
                    </div>
                    <DialogActions>
                        <Button onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={resetCalendarSettingHandler} style={{ backgroundColor: 'red', color: 'white' }}>Reset</Button>
                    </DialogActions>
                </Dialog>
        </Dialog>
    );
};

export default CalendarSettings;