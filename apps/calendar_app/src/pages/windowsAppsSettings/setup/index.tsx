import React, { useState } from "react";
import dynamic from 'next/dynamic';
import {
    Container,
    Button,
    Grid,
    Typography,
    Box,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";

import appConstants from "@/constants/appConstants";
import persistenceManager from "@/data/PersistenceManager";
import NewViewInstanceExistingSetupComponent from "@/components/NewViewInstanceSetupComponent/NewViewInstanceExistingSetupComponent";

const NewViewInstanceInitialSetupComponentpSSR = dynamic(() => import('@/components/NewViewInstanceSetupComponent/NewViewInstanceInitialSetupComponent'), {
    ssr: false, // disables server-side rendering for the component
});

enum SetupOption {
    INITIAL_SETUP,
    PAIRING_TO_EXISTING_SETUP,
}

const WindowsAppsSettingsSetup = () => {
    const [viewInstanceAccessTokenForWindowsApps, setViewInstanceAccessTokenForWindowsApps] = useState<string | null>(persistenceManager.getViewInstanceAccessTokenForWindowsAppsData());

    const [selectedOption, setSelectedOption] = useState<SetupOption>(SetupOption.INITIAL_SETUP);

    const resetTokenPermanently = () => {
        persistenceManager.deleteViewInstanceAccessTokenForWindowsAppsData();
        setViewInstanceAccessTokenForWindowsApps(null);
    }

    const saveTokenPermanently = (token: string ) => {
        persistenceManager.setViewInstanceAccessTokenForWindowsAppsData(token);
        setViewInstanceAccessTokenForWindowsApps(token);
    }

    if (viewInstanceAccessTokenForWindowsApps != null) {
        return (
            <Box>
                <Container maxWidth="sm">
                    <Typography
                        variant="h4"
                        gutterBottom
                        paddingBottom={3}
                        margin={0}
                    >
                        Windows Apps Are Set Up Correctly
                    </Typography>
                    <Typography
                        variant="h6"
                        gutterBottom
                        paddingBottom={3}
                        margin={0}
                    >
                        If you haven't done so yet, please go to Control Centre and approve permission request made by this new View Instance.
                    </Typography>
                    <Typography
                        variant="h6"
                        gutterBottom
                        paddingBottom={3}
                        margin={0}
                    >
                        You need to open calendar application there and in application's detail you will see unapproved permission reuqest. Only then will this feature be usable.
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        href="/windowsAppsSettings"
                    >
                        Go To Windows Apps Settings
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={resetTokenPermanently}
                        sx={{ mt: 4}}
                    >
                        Reset View Instance For Windows Apps Data
                    </Button>
                </Container>
            </Box>
        )
    }

    return (
        <Box sx={{ my: 4 }}>
            <Grid container spacing={2} sx={{ my: 4 }}>
                <Container maxWidth="md">
                    <Typography
                        variant="h4"
                        gutterBottom
                        paddingBottom={3}
                        margin={0}
                    >
                        Windows Apps Set Up
                    </Typography>

                    <ToggleButtonGroup
                        color="primary"
                        value={selectedOption}
                        exclusive
                        onChange={(event, newOption) =>
                            setSelectedOption(newOption)
                        }
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
                        <NewViewInstanceInitialSetupComponentpSSR
                            firstParagraph="You need to create manually a new View Template
                            in the Control Centre. Download the following
                            javascript file."
                            secondParagraph={(
                                <>
                                    In profiles section, you need to add
                                    <Box
                                        component="span"
                                        sx={{
                                            backgroundColor: "grey.300",
                                            padding: "0.2rem 0.5rem",
                                            borderRadius: "4px",
                                            fontWeight: "bold",
                                            margin: "0.2rem",
                                        }}
                                    >
                                        {appConstants.windowsOpenedAppsActivityTrackerEventName}
                                    </Box>{" "}
                                    event and add <b>READ</b> access right
                                </>
                            )}
                            filesToDownload={
                                [{ path: '/viewTemplates/windowsOpenedAppsUniqueNamesListViewTemplateFunctions/main.js', name: 'Main.js' }]
                            }
                            newViewInstanceMessageForDataStorageSystem={appConstants.viewInstanceAccessNameForWindowsAppsData}
                            showProceedButton={false}
                            onProceed={() => { }}
                            onViewInstanceCreated={(token) => { saveTokenPermanently(token) }}
                        />
                    )}

                    {selectedOption == SetupOption.PAIRING_TO_EXISTING_SETUP && (
                        <NewViewInstanceExistingSetupComponent 
                            viewInstanceAccessTokenName={appConstants.viewInstanceAccessNameForWindowsAppsData}
                            onSaveToken={token => saveTokenPermanently(token)}
                        />
                    )}
                </Container>
            </Grid>
        </Box>
    );
};

export default WindowsAppsSettingsSetup;
