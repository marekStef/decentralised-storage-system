import React, { useState } from "react";
import { useRouter } from 'next/router';
import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Alert,
} from "@mui/material";


import persistenceManager from '@/data/PersistenceManager';


import AndroidLocationInitialSetup from "@/components/forPages/androidLocationsSpecific/AndroidLocationInitialSetup/AndroidLocationInitialSetup";
import AndroidLocationExistingSetup from "@/components/forPages/androidLocationsSpecific/AndroidLocationExistingSetup/AndroidLocationExistingSetup";

enum SetupOption {
    INITIAL_SETUP,
    PAIRING_TO_EXISTING_SETUP,
}

const AndroidLocationsSettingsPage = () => {
    const Router = useRouter();

    const [viewInstanceAccessTokenForLocationTrackerEvents, setViewInstanceAccesstokenForLocationTrackerEvents] = useState(persistenceManager.getViewInstanceAccessTokenForAndroidLocations());

    const [selectedOption, setSelectedOption] = useState<SetupOption>(SetupOption.INITIAL_SETUP);

    const setViewInstanceTokenForLocationTracker = (token: string) => {
        setViewInstanceAccesstokenForLocationTrackerEvents(token);
        persistenceManager.setViewInstanceAccessTokenForAndroidLocations(token);
    }

    const deleteViewInstanceForLocationTrackerFromThisBrowser = () => {
        persistenceManager.deleteViewInstanceAccessTokenForAndroidLocations();
        setViewInstanceAccesstokenForLocationTrackerEvents(null);
    }

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Typography
                variant="h4"
                gutterBottom
                paddingBottom={3}
                margin={0}
            >
                Android Locations
            </Typography>

            {viewInstanceAccessTokenForLocationTrackerEvents != null ? (
                <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5" component="h4" gutterBottom>
                        Everything is properly set up
                    </Typography>
                    <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ wordBreak: 'break-word' }}
                    >
                        {viewInstanceAccessTokenForLocationTrackerEvents}
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={deleteViewInstanceForLocationTrackerFromThisBrowser}
                        sx={{ mt: 2 }}
                    >
                        Reset Setup
                    </Button>
                </Box>
            ) : (
                <Box sx={{ my: 4 }}>
                    <ToggleButtonGroup
                        color="primary"
                        value={selectedOption}
                        exclusive
                        onChange={(event, newOption) => setSelectedOption(newOption)}
                        fullWidth
                        style={{ marginBottom: "2rem" }}
                    >
                        <ToggleButton value={SetupOption.INITIAL_SETUP}>
                            Initial Setup
                        </ToggleButton>
                        <ToggleButton
                            value={SetupOption.PAIRING_TO_EXISTING_SETUP}
                        >
                            Pairing to Existing Setup
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {selectedOption == SetupOption.INITIAL_SETUP && (
                        <AndroidLocationInitialSetup
                            setViewInstanceTokenForLocationTracker={setViewInstanceTokenForLocationTracker}
                        />
                    )}

                    {selectedOption == SetupOption.PAIRING_TO_EXISTING_SETUP && (
                        <AndroidLocationExistingSetup
                            setViewInstanceTokenForLocationTracker={setViewInstanceTokenForLocationTracker}
                        />
                    )}
                </Box>
            )}


        </Container>
    );
};

export default AndroidLocationsSettingsPage;