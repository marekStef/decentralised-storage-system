//#region Imports
const express = require('express');
const fs = require('fs');
const path = require('path');
const DataViewStore = require('./DataViewStore');

//#endregion

//#region Constants

const {PORT} = require('./Constants/Server');

const {PATH_TO_SAVED_DATA_VIEW_TRANSFORMER_FUNCTIONS} = require('./Constants/DataViewTransformersRelated');

//#endregion

//#region Run Upon Start

const app = express();
app.use(express.json()); 

const dataViewStore = new DataViewStore();
dataViewStore.Start();

//#endregion

app.post('/createNewDataView', async (req, res) => {
    const appId = req.body.appId;
    const viewId = req.body.viewId;
    const files = req.body.javascriptFiles;
    const mainFileName = req.body.mainJavascriptEntry; // Assuming one of the files is always named main.js
    const mainEntryFunctionParameters = req.body.mainEntryParameters; 

    const dataViewTransformerFunctionsDirectoryForThisApp = await getPathToDataViewTransformerFunctionsDirectoryOfGivenApp(appId, viewId, true);
    
    await Promise.all(files.map(async file => {
        const filePath = path.join(dataViewTransformerFunctionsDirectoryForThisApp, file.originalName);
        await fs.promises.writeFile(filePath, file.data);
    }));

    // Rename the main file name entry to a [viewId].js
    const mainEntryFileNameOld = await path.join(dataViewTransformerFunctionsDirectoryForThisApp, mainFileName);
    const mainEntryModuleName = await path.join(dataViewTransformerFunctionsDirectoryForThisApp, `${viewId}.js`);

    try {
        await fs.promises.rename(mainEntryFileNameOld, mainEntryModuleName);
        console.log("File renamed successfully!");
    } catch (error) {
        console.error("Error renaming file:", error);
        throw new Error(error);
    }

    // Clear Node.js require cache to allow dynamic module reloading
    delete require.cache[require.resolve(mainEntryModuleName)];
    
    // Dynamically load the main module
    require(mainEntryModuleName); // This will also require the other files if main.js has dependencies

    // Return the URL for accessing the function in the module
    res.send({ url: `http://localhost:${PORT}/runFunction/${appId}/${viewId}` });
});

app.get('/runFunction/:appId/:viewId', async (req, res) => {
    const { appId, viewId } = req.params;
    const { functionParameters } = req.body;

    console.log(functionParameters);
    const transformerFunctionsDir = await getPathToDataViewTransformerFunctionsDirectoryOfGivenApp(appId, viewId, false);
    
    if (transformerFunctionsDir == null) // it does not exist - wrong view
        return res.status(400).send({error: "Such Data View does not exist."});

    const moduleEntryPath = path.join(transformerFunctionsDir, `${viewId}.js`);

    if (!moduleEntryPath) {
        return res.status(400).send('Module not available');
    }

    const dynamicModule = require(moduleEntryPath);
    if (!dynamicModule) {
        return res.status(400).send('Function not available');
    }

    const result = functionParameters && Array.isArray(functionParameters) ? dynamicModule(...functionParameters) : dynamicModule();
    res.send({ result });
});

app.listen(PORT, () => console.log(`DataViewStore server running on port ${PORT}!`));

//#region Helpers
const getPathToDataViewTransformerFunctionsDirectoryOfGivenApp = async (appId, viewId, createIfNotPresent) => {
    const dir = await path.join(PATH_TO_SAVED_DATA_VIEW_TRANSFORMER_FUNCTIONS, appId, viewId);
    if (!fs.existsSync(dir)) {
        if (createIfNotPresent)
            await fs.promises.mkdir(dir, {recursive: true});
        else return null;
    } 
    return dir;
}
//#endregion
