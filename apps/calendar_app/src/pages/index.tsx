import React, { useEffect, useState } from 'react';

import withSetupValidation from '@/higherOrderComponents/withSetupValidation';
import { colors } from '@mui/material';
import persistenceManager from '@/data/PersistenceManager';

const Index = () => {
    const [showLoadingText, setShowLoadingText] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setShowLoadingText(true);
        }, 1000)
        
    }, [])
    return (
        <h1
            style={{
                width: '100vw',
                height: '100vh',
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: colors.grey[500]
            }}
        > 
            {showLoadingText && 'Loading you calendar...'}
        </h1>
    )
}

export default withSetupValidation(Index);