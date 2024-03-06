import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
    ToggleButton, ToggleButtonGroup
} from '@mui/material';

import withSetupValidation from '@/higherOrderComponents/withSetupValidation';
import InitialSetup from '../../components/forPages/forSetupPage/InitialSetup/InitialSetup';
import PairingToExistingSetup from '../../components/forPages/forSetupPage/PairingToExistingSetup/PairingToExistingSetup';

enum SetupOption {
    INITIAL_SETUP,
    PAIRING_TO_EXISTING_SETUP
}

const SetupPage = () => {
    const [selectedOption, setSelectedOption] = useState<SetupOption>(SetupOption.INITIAL_SETUP);

    return (
        <Container maxWidth="sm">
            
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Server Setup
                </Typography>

                <ToggleButtonGroup
                    color="primary"
                    value={selectedOption}
                    exclusive
                    onChange={(event, newOption) => setSelectedOption(newOption)}
                    fullWidth
                    style={{ marginBottom: '2rem'}}
                >
                    <ToggleButton value={SetupOption.INITIAL_SETUP}>Initial Setup</ToggleButton>
                    <ToggleButton value={SetupOption.PAIRING_TO_EXISTING_SETUP}>Pairing to Existing Setup</ToggleButton>
                </ToggleButtonGroup>

                { selectedOption == SetupOption.INITIAL_SETUP && (
                    <InitialSetup />
                )}

                { selectedOption == SetupOption.PAIRING_TO_EXISTING_SETUP && (
                    <PairingToExistingSetup />
                )}
                
            </Box>
        </Container>
    );

};

export default withSetupValidation(SetupPage);