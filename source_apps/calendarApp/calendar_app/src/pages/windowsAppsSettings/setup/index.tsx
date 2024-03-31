import React, { useState } from "react";
import dynamic from 'next/dynamic';
import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import appConstants from "@/constants/appConstants";
import networkManager, { PossibleResultsWithServer } from "@/Network/NetworkManager";
import persistenceManager from "@/data/PersistenceManager";
import { showError, showSuccess } from "@/components/AlertProvider/AlertProvider";
import { useRouter } from "next/router";
import NewViewInstanceExistingSetupComponent from "@/components/NewViewInstanceSetupComponent/NewViewInstanceExistingSetupComponent";

const NewViewInstanceSetupComponentpSSR = dynamic(() => import('@/components/NewViewInstanceSetupComponent/NewViewInstanceInitialSetupComponent'), {
    ssr: false, // disables server-side rendering for the component
});

enum SetupOption {
    INITIAL_SETUP,
    PAIRING_TO_EXISTING_SETUP,
}

const WindowsAppsSettingsSetup = () => {
    const Router = useRouter();

    const [viewTemplateId, setViewTemplateId] = useState<string>("");
    const [viewInstanceSendingStatus, setViewInstanceSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);
    const [viewInstanceAccessTokenForWindowsApps, setViewInstanceAccessTokenForWindowsApps] = useState<string | null>(persistenceManager.getViewInstanceAccessTokenForWindowsAppsData());

    const [selectedOption, setSelectedOption] = useState<SetupOption>(SetupOption.INITIAL_SETUP);

    const createNewViewInstance = () => {
        if (
            viewInstanceSendingStatus == PossibleResultsWithServer.IS_LOADING ||
            viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS
        )
            return;

        networkManager
            .createNewViewInstance(viewTemplateId, "View access for getting unique apps names")
            .then((response) => {
                persistenceManager.setViewInstanceAccessTokenForWindowsAppsData(
                    response.viewAccessToken
                );
                console.log(response);
                showSuccess(response.message);
                setViewInstanceSendingStatus(PossibleResultsWithServer.SUCCESS);
            })
            .catch((errResponse) => {
                setViewInstanceSendingStatus(PossibleResultsWithServer.FAILED);
                console.log(errResponse, "heeeere");
                showError(errResponse.message);
            });
    };

    const resetTokenPermanently = () => {
        
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
                        onClick={() => {}}
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
                        <NewViewInstanceSetupComponentpSSR
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
                                [{ path: '/windowsOpenedAppsUniqueNamesListViewTemplateFunctions/main.js', name: 'Main.js' }]
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
