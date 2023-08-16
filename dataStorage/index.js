//#region Imports
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const DataViewStoreHandler = require('./DataViewStoreHandler');
//#endregion

//#region Constants
const PORT = 3000;
const MAXIMUM_NUMBER_OF_UPLOADED_FILES = 10;
//#endregion

//#region Run Upon Start

const dataViewStoreHandler = new DataViewStoreHandler();
dataViewStoreHandler.Start();

//#endregion

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/create_new_data_view', upload.array('files', MAXIMUM_NUMBER_OF_UPLOADED_FILES), 
    async (req, res) => {
        const uploadedJavascriptFiles = req.files;
        const mainJavascriptEntry = req.body.mainEntry; // this file needs to export by default one function which will be called
        
        // this is an array of types of parameters - TODO - not sure about this
        const mainEntryFunctionParameters = req.body.mainEntryParameters; 

        // id of the app which wants to create this new view on data - I'll get this from token in the future
        const appId = "alsdkfjaoqji1231234adsfklaf";

        const newDataViewId = uuidv4();
        
        if (!uploadedJavascriptFiles || !mainJavascriptEntry || !mainEntryFunctionParameters || !Array.isArray(mainEntryFunctionParameters)) {
            return res.sendStatus(400);
        }

        try {
            const responseUrl = await dataViewStoreHandler.CreateNewDataViewTransformer(
                appId,
                newDataViewId,
                uploadedJavascriptFiles,
                mainJavascriptEntry,
                mainEntryFunctionParameters,
            );
        
            res.send({
                url: responseUrl
            });
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    }
);

app.listen(PORT, () => console.log(`Server A running on port ${PORT}!`));
