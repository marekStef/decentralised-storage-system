//region imports
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pm2 = require('pm2');
require('dotenv').config();

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
    // Start the DataViewStore server using PM2
    pm2.start({
        script: path.join('..', 'dataViewStore', 'index.js'),
        name: 'DataViewStoreServer',
        exec_mode : 'fork', // Fork mode must be used to take advantage of the PM2 API
        env: {  // Environment variables
            'DATA_VIEW_STORE_PORT': process.env.DATA_VIEW_STORE_SERVER_PORT,
        }
    }, (err) => {
        if (err) {
            logger.log({
                level: 'error',
                message: `Failed to start child process: ${err}`,
            });
            return;
        }

        logger.log({
            level: 'info',
            message: 'DataViewStore Server started',
        });

        pm2.launchBus((err, bus) => {
            bus.on('log:out', (packet) => {
                if (packet.process.name === 'DataViewStoreServer') {
                    logger.log({
                        level: 'info',
                        message: `[DataViewStore Server (log:out)]: ${packet.data}`,
                    });
                }
            });

            bus.on('log:err', (packet) => {
                if (packet.process.name === 'DataViewStoreServer') {
                    logger.log({
                        level: 'error',
                        message: `[DataViewStore Server (log:err)]: ${packet.data}`,
                    });
                }
            });

            // for receiving messages sent from your child process
            bus.on('process:msg', function(data) {
                if (data.raw.type === "dataViewStoreServerUrl") {
                    dataViewStoreUrl = data.raw.url;

                    logger.log({
                        level: 'info',
                        message: `Received url from DataViewStoreServer: ${dataViewStoreUrl}`,
                    });
                }

            });

            bus.on('process:event', function(data) {
                if (data.process.name === 'DataViewStoreServer') {
                    if (data.event === 'exit') {
                        logger.log({
                            level: 'error',
                            message: `DataViewStoreServer process exited.`,
                        });
                    }
                }
            });
        });
    });
}

//
/**
 * Stops and deletes the DataViewStore server from PM2's list
 */
const stopDataViewStore = () => {
    pm2.stop('DataViewStoreServer', (err) => {
        if (err) {
            logger.log({
                level: 'error',
                message: `Failed to stop DataViewStoreServer: ${err}`,
            });
            return;
        }
        pm2.delete('DataViewStoreServer', () => {
            logger.log({
                level: 'info',
                message: 'DataViewStore Server stopped and deleted',
            });
        });
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
    stopDataViewStore,
    createNewDataViewTransformerInDataViewStore
};