import { Button, Grid, TextField } from '@mui/material';
import React, { useState } from 'react';

interface NewViewInstanceExistingSetupComponentParams {
    onSaveToken: (token: string) => void,
    viewInstanceAccessTokenName: string
}

const NewViewInstanceExistingSetupComponent: React.FC<NewViewInstanceExistingSetupComponentParams> = (params) => {
    const [viewInstanceTokenValue, setViewInstanceTokenValue] = useState<string>('');

    return (
        <Grid container spacing={2} sx={{ my: 4 }}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label={"View Instance Access Token (named: " + params.viewInstanceAccessTokenName + ")"}
                    type="text"
                    variant="outlined"
                    value={viewInstanceTokenValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setViewInstanceTokenValue(event.target.value)}
                    helperText="This token should be found near the existing app holder data"
                />
            </Grid>

            <Grid item xs={12}>
                <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() => params.onSaveToken(viewInstanceTokenValue)}
                >
                    Save Configuration
                </Button>
            </Grid>
        </Grid>
    )
};

export default NewViewInstanceExistingSetupComponent;