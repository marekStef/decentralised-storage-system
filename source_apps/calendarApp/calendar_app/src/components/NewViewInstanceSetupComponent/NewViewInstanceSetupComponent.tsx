import React, { useState } from "react";
import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    Box,
} from "@mui/material";

import GetAppIcon from "@mui/icons-material/GetApp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import networkManager, { PossibleResultsWithServer } from "../../Network/NetworkManager";
import {
    showError,
    showSuccess,
} from "@/components/AlertProvider/AlertProvider";

interface FileToDownload {
    path: string;
    name: string;
}

interface NewViewInstanceSetupComponentParams {
    firstParagraph: any,
    secondParagraph: any,
    filesToDownload: FileToDownload[];
    newViewInstanceMessageForDataStorageSystem: string;
    showProceedButton: boolean,
    onProceed: () => void;
    onViewInstanceCreated: (token: string) => void;
}

const NewViewInstanceSetupComponent: React.FC<NewViewInstanceSetupComponentParams> = (params) => {
    const [viewTemplateId, setViewTemplateId] = useState<string>("");
    const [viewInstanceSendingStatus, setViewInstanceSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const createNewViewInstance = () => {
        if (viewInstanceSendingStatus == PossibleResultsWithServer.IS_LOADING || viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS)
            return;

        networkManager
            .createNewViewInstance(viewTemplateId, params.newViewInstanceMessageForDataStorageSystem)
            .then((response) => {
                params.onViewInstanceCreated(response.viewAccessToken);
                setViewInstanceSendingStatus(PossibleResultsWithServer.SUCCESS);
                showSuccess(response.message);
            })
            .catch((errResponse) => {
                setViewInstanceSendingStatus(PossibleResultsWithServer.FAILED);
                console.log(errResponse, "<<<- failed to create new view instance");
                showError(errResponse.message);
            });
    };

    return (
        <Box sx={{ my: 4 }}>
            <Grid container spacing={2} sx={{ my: 4 }}>
                <Container maxWidth="md">
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
                                {params.firstParagraph}
                            </Typography>

                            <Typography variant="body1" sx={{ margin: "1rem" }}>
                                {params.secondParagraph}
                            </Typography>

                            <Box
                                display="flex"
                                flexDirection="column"
                                gap="0.5rem"
                                alignItems="center"
                            >
                                {params.filesToDownload.map((file, index) => (
                                    <Button
                                        key={file.name}
                                        variant="contained"
                                        color="primary"
                                        href={file.path}
                                        download
                                        startIcon={<GetAppIcon />}
                                    >
                                        Download {file.name}
                                    </Button>
                                ))}

                            </Box>
                        </Box>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="View Template ID"
                                type="text"
                                variant="outlined"
                                value={viewTemplateId}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setViewTemplateId(event.target.value)}
                                helperText="You need to create View Template manually in the Control Centre and paste its ID here"
                                disabled={viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS}
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
                                        disabled={viewInstanceSendingStatus == PossibleResultsWithServer.IS_LOADING}
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
                            {viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS && (
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
                            {viewInstanceSendingStatus == PossibleResultsWithServer.FAILED && (
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
                        {params.showProceedButton && (
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={params.onProceed}
                                    disabled={viewInstanceSendingStatus != PossibleResultsWithServer.SUCCESS}
                                >
                                    Proceed
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Container>
            </Grid>
        </Box>
    )
}

export default NewViewInstanceSetupComponent;