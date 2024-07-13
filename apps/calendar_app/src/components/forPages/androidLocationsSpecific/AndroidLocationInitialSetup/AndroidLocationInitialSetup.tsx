import React from 'react';
import { Box } from "@mui/material";

import appConstants from "@/constants/appConstants";
import dynamic from 'next/dynamic';

const NewViewInstanceSetupComponentpSSR = dynamic(() => import('@/components/NewViewInstanceSetupComponent/NewViewInstanceInitialSetupComponent'), {
    ssr: false, // disables server-side rendering for the component
});

interface AndroidLocationInitialSetupParams {
    setViewInstanceTokenForLocationTracker: (token: string) => void
}

const AndroidLocationInitialSetup: React.FC<AndroidLocationInitialSetupParams> = (params) => {
    return (
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
                        {appConstants.androidLocationTrackerAppEventName}
                    </Box>{" "}
                    event and add READ access right
                </>
            )}
            filesToDownload={
                [{path: '/viewTemplates/androidLocationTrackerAppRelated/main.js', name: 'Main.js'}]
            }
            newViewInstanceMessageForDataStorageSystem={appConstants.viewInstanceAccessNameForLocationTrackerAppData}
            showProceedButton={false}
            onProceed={() => {}}
            onViewInstanceCreated={(token) => {
                params.setViewInstanceTokenForLocationTracker(token);
                // console.log(token);
            }}
        />
    )
}

export default AndroidLocationInitialSetup;