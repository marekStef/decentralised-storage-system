import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
    ToggleButton, ToggleButtonGroup, InputLabel, Select, MenuItem, SelectChangeEvent, Alert
} from '@mui/material';

import PersistenceManager from '@/data/PersistenceManager';
import React from 'react';
import Link from 'next/link';

const WindowsAppsSettingsPage = () => {
    const isWindowsAppsSetUp = PersistenceManager.getViewInstanceAccessTokenForWindowsAppsUniqueNamesList() != null;

    return (
        <Container maxWidth="sm">

            <Box sx={{ my: 4 }}>
                <Grid container spacing={2} sx={{ my: 4 }}>
                    <Typography variant="h4" gutterBottom paddingBottom={3} margin={0}>
                        Windows Apps
                    </Typography>

                        {isWindowsAppsSetUp ? (
                            <>
                            </>
                        ) : (
                            <Container>
                                <Link href="/windowsAppsSettings/setup">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => {}}
                                    >
                                        Set Up Windows Apps History
                                    </Button>
                                </Link>
                            </Container>
                        )}
                </Grid>


            </Box>
        </Container>
    );
};

export default WindowsAppsSettingsPage;