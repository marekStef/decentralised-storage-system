//region imports
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { spawn } = require('child_process');
const {DataViewStoreServerNotRunningError} = require("../utils/customErrors/dataViewStoreErrors");
const logger = require('../logger/winston');
//endregion

//region runtime constants
let dataViewStoreUrl = null;
//endregion

/**
 * Starts the DataViewStore server as a child process.
 * Automatically restarts the server if it crashes.
 * Updates `dataViewStoreUrl` when the server successfully starts.
 */
const startDataViewStore = () => {
    const dataViewStoreServer = spawn('node', [path.join('..', 'dataViewStore', 'index.js')], {
        // Specifies the input/output configuration for the child process
        // 'ipc': Enables inter-process communication between the child and parent
        // 'pipe': Creates a pipe for stdout, allowing the parent to read the output of the child
        // 'pipe': Creates a pipe for stderr, allowing the parent to read error messages from the child
        stdio: ['ipc', 'pipe', 'pipe']  
    });

    dataViewStoreServer.on('error', (err) => {
        logger.log({
            level: 'error',
            message: `Failed to start child process: ${err}`,
        });
    });

    dataViewStoreServer.on('message', (message) => {
        if (message.type === 'dataViewStoreServerStarted') {
            logger.log({
                level: 'info',
                message: `dataViewStoreServerStarted: ${message.url}`,
            });
            dataViewStoreUrl = message.url;
        }
    });

    dataViewStoreServer.stdout.on('data', (data) => {
        logger.log({
            level: 'info',
            message: `[DataViewStore Server (stdout)]: ${data}`,
        });
    });

    dataViewStoreServer.stderr.on('data', (data) => {
        logger.log({
            level: 'error',
            message: `[DataViewStore Server (stderr)]: ${data}`,
        });
    });

    dataViewStoreServer.on('exit', (code) => {
        logger.log({
            level: 'error',
            message: `[DataViewStore Server(exit)] exited with code ${code}. Restarting...`,
        });
        startDataViewStore();
    });
}

/**
 * Creates a new DataView transformer in the DataViewStore server.
 *
 * @param {string} appId - The ID of the application for which the DataView is being created.
 * @param {string} newDataViewId - The ID for the new DataView.
 * @param {Array<Object>} uploadedJavascriptFiles - An array of uploaded JavaScript files. Each object must contain properties `path` and `originalname`.
 * @param {string} mainJavascriptEntry - The main entry point JavaScript file.
 * @param {Object} mainEntryFunctionParameters - Parameters to be passed to the main entry function.
 *
 * @throws {DataViewStoreServerNotRunningError} Throws an error if the DataViewStore server is not running.
 *
 * @returns {Promise<string>} Returns a Promise that resolves to the URL of the created DataViewTransformer.
 */
const createNewDataViewTransformerInDataViewStore = async (appId, newDataViewId, uploadedJavascriptFiles, mainJavascriptEntry, mainEntryFunctionParameters) => {
    const fileData = uploadedJavascriptFiles.map(file => ({
        originalName: file.originalname,
        data: fs.readFileSync(file.path, 'utf8')
    }));

    if (dataViewStoreUrl === null) throw new DataViewStoreServerNotRunningError();
    
    const response = await axios.post(
        `${dataViewStoreUrl}/createNewDataView`, 
        {
            appId,
            viewId: newDataViewId,
            javascriptFiles: fileData,
            mainJavascriptEntry,
            mainEntryFunctionParameters
        }
    );
    return response.data.url;
}

module.exports = {
    startDataViewStore,
    createNewDataViewTransformerInDataViewStore
};