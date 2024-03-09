const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pm2 = require('pm2');
require('dotenv').config();

const logger = require('../logger/winston');

//region runtime constants
let javascriptExecutionServiceRuntimeUrl = null;
//endregion

const JS_EXECUTION_SERVICE_URL_MESSAGE = 'JS_EXECUTION_SERVICE_URL_MESSAGE';

const startJavascriptExecutionService = () => {
    // Start the js execution service server using PM2
    pm2.start({
        script: path.join('..', 'javascriptExecutionService', 'index.js'), // todo - not very nice
        name: 'javascriptExecutionService',
        max_restarts: 10,
        min_uptime: '60s',
        exp_backoff_restart_delay: 100,
        exec_mode : 'fork', // Fork mode must be used to take advantage of the PM2 API
        // env: {  // Environment variables
        //     'VIEW_MANAGER_PORT': process.env.DATA_VIEW_STORE_SERVER_PORT, // todo - do i have to pass my port to it? or is docker enough for hardcoding ports?
        // }
    }, (err) => {
        if (err) {
            logger.log({
                level: 'error',
                message: `Failed to start child javascriptExecService process: ${err}`,
            });
            return;
        }

        logger.log({
            level: 'info',
            message: 'javascriptExecService started',
        });

        pm2.launchBus((err, bus) => {
            bus.on('log:out', (packet) => {
                if (packet.process.name === 'javascriptExecutionService') {
                    logger.log({
                        level: 'info',
                        message: `[javascriptExecutionService Server (log:out)]: ${packet.data}`,
                    });
                }
            });

            bus.on('log:err', (packet) => {
                if (packet.process.name === 'javascriptExecutionService') {
                    logger.log({
                        level: 'error',
                        message: `[javascriptExecutionService Server (log:err)]: ${packet.data}`,
                    });
                }
            });

            // for receiving messages sent from child process
            bus.on('process:msg', function(data) {
                if (data.raw.type === JS_EXECUTION_SERVICE_URL_MESSAGE) {
                    javascriptExecutionServiceRuntimeUrl = data.raw.url;

                    logger.log({
                        level: 'info',
                        message: `Received url from js execution service: ${javascriptExecutionServiceRuntimeUrl}`,
                    });
                }

            });

            bus.on('process:event', function(data) {
                if (data.process.name === 'javascriptExecutionService') {
                    if (data.event === 'exit') {
                        logger.log({
                            level: 'error',
                            message: `javascriptExecutionService process exited.`,
                        });
                    }
                }
            });
        });
    });
}

//
/**
 * Stops and deletes the js exec service server from PM2's list
 */
const stopJavascriptExecutionService = () => {
    pm2.stop('javascriptExecutionService', (err) => {
        if (err) {
            logger.log({
                level: 'error',
                message: `Failed to stop javascriptExecutionService: ${err}`,
            });
            return;
        }
        pm2.delete('javascriptExecutionService', () => {
            logger.log({
                level: 'info',
                message: 'javascriptExecutionService Server stopped and deleted',
            });
        });
    });
}

module.exports = {
    startJavascriptExecutionService,
    stopJavascriptExecutionService,
};