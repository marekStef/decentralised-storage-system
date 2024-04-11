import React, { useState } from 'react';
import appConstants from "@/constants/appConstants";
import NewViewInstanceExistingSetupComponent from '@/components/NewViewInstanceSetupComponent/NewViewInstanceExistingSetupComponent';

interface AndroidLocationExistingSetupParams {
    setViewInstanceTokenForLocationTracker: (token: string) => void
}

const AndroidLocationExistingSetup: React.FC<AndroidLocationExistingSetupParams> = (params) => {
    return (
        <NewViewInstanceExistingSetupComponent 
            viewInstanceAccessTokenName={appConstants.viewInstanceAccessNameForLocationTrackerAppData}
            onSaveToken={viewInstanceAccessTokenForLocationTrackerData => params.setViewInstanceTokenForLocationTracker(viewInstanceAccessTokenForLocationTrackerData)}
        />
    )
}

export default AndroidLocationExistingSetup;