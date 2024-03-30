import React, { useState } from "react";
import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import appConstants from "@/constants/appConstants";
import networkManager from "@/Network/NetworkManager";
import persistenceManager from "@/data/PersistenceManager";
import {
    showError,
    showSuccess,
} from "@/components/AlertProvider/AlertProvider";
import { useRouter } from "next/router";

enum PossibleResultsWithServer {
    NOT_TRIED,
    IS_LOADING,
    SUCCESS,
    FAILED,
}

const WindowsAppsSettingsSetup = () => {
    const Router = useRouter();
    
    const [viewTemplateId, setViewTemplateId] = useState<string>("");
    const [viewInstanceSendingStatus, setViewInstanceSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const createNewViewInstance = () => {
        if (
            viewInstanceSendingStatus == PossibleResultsWithServer.IS_LOADING ||
            viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS
        )
            return;

        networkManager
            .createNewViewInstance(viewTemplateId, "View access for getting unique apps names")
            .then((response) => {
                persistenceManager.setViewInstanceAccessTokenForWindowsAppsUniqueNamesList(
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

    return (
        <Box sx={{ my: 4 }}>
            <Grid container spacing={2} sx={{ my: 4 }}>
                <Container maxWidth="sm">
                    <Typography
                        variant="h4"
                        gutterBottom
                        paddingBottom={3}
                        margin={0}
                    >
                        Windows Apps Set Up
                    </Typography>
                    <Grid container spacing={2}>
                        <Box
                            sx={{
                                margin: "1rem",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="body1" sx={{ margin: "1rem" }}>
                                You need to create manually a new View Template
                                in the Control Centre. Download the following
                                two javascript files.
                            </Typography>

                            <Typography variant="body1" sx={{ margin: "1rem" }}>
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
                            </Typography>

                            <Box
                                display="flex"
                                flexDirection="column"
                                gap="0.5rem"
                                alignItems="center"
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href="/windowsOpenedAppsUniqueNamesListViewTemplateFunctions/main.js"
                                    download
                                    startIcon={<GetAppIcon />}
                                >
                                    Download Main.js
                                </Button>
                            </Box>
                        </Box>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="View Template ID"
                                type="text"
                                variant="outlined"
                                value={viewTemplateId}
                                onChange={(event) =>
                                    setViewTemplateId(event.target.value)
                                }
                                helperText="You need to create View Template manually in the Control Centre and paste its ID here"
                                disabled={
                                    viewInstanceSendingStatus ==
                                    PossibleResultsWithServer.SUCCESS
                                }
                            />
                        </Grid>

                        {viewInstanceSendingStatus !=
                            PossibleResultsWithServer.SUCCESS && (
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={createNewViewInstance}
                                    disabled={
                                        viewInstanceSendingStatus ==
                                        PossibleResultsWithServer.IS_LOADING
                                    }
                                >
                                    Create View Instance Based On View Template
                                </Button>
                            </Grid>
                        )}

                        <Grid
                            item
                            xs={12}
                            container
                            justifyContent="center"
                            alignItems="center"
                        >
                            {viewInstanceSendingStatus ==
                                PossibleResultsWithServer.SUCCESS && (
                                <>
                                    <CheckCircleOutlineIcon color="success" />
                                    <Typography
                                        variant="body1"
                                        color="success.main"
                                        style={{ marginLeft: "1rem" }}
                                    >
                                        View Instance Created
                                    </Typography>
                                </>
                            )}
                            {viewInstanceSendingStatus ==
                                PossibleResultsWithServer.FAILED && (
                                <>
                                    <ErrorOutlineIcon color="error" />
                                    <Typography
                                        variant="body1"
                                        color="error.main"
                                        style={{ marginLeft: "1rem" }}
                                    >
                                        View Instance Setup Failed
                                    </Typography>
                                </>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => Router.back()}
                                disabled={
                                    viewInstanceSendingStatus !=
                                    PossibleResultsWithServer.SUCCESS
                                }
                            >
                                Proceed
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Grid>
        </Box>
    );
};

export default WindowsAppsSettingsSetup;
