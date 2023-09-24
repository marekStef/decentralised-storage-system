const fs = require('fs');
const path = require('path');
const { getPathToDataViewTransformerFunctionsDirectoryOfGivenApp } = require('../helpers/pathHelper');
const {getDataViewStoreServerAddress} = require("../configuration/configuration");

exports.createNewDataView = async (req, res) => {
    const {appId, viewId, javascriptFiles, mainJavascriptEntry} = req.body; // for mainJavascriptEntry assuming one of the files is always named main.js

    const mainEntryFunctionParameters = req.body.mainEntryParameters; // TODO

    const dataViewTransformerFunctionsDirectoryForThisApp = await getPathToDataViewTransformerFunctionsDirectoryOfGivenApp(appId, viewId, true);

    await Promise.all(javascriptFiles.map(async file => {
        const filePath = path.join(dataViewTransformerFunctionsDirectoryForThisApp, file.originalName);
        await fs.promises.writeFile(filePath, file.data);
    }));

    // Rename the main file name entry to a [viewId].js
    const mainEntryFileNameOld = path.join(dataViewTransformerFunctionsDirectoryForThisApp, mainJavascriptEntry);
    const mainEntryModuleName = path.join(dataViewTransformerFunctionsDirectoryForThisApp, `${viewId}.js`);

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
    res.send({ url: `${getDataViewStoreServerAddress()}/runFunction/${appId}/${viewId}` });
};

exports.runDataViewFunction = async (req, res) => {
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
};