require('dotenv').config();
const express = require('express');
const cors = require('cors');
const registerRoutes = require('./src/routeRegistrar');

const {startDataViewStore} = require('./src/services/DataViewStoreService');
const logger = require('./src/logger/winston');
const { gracefulShutdown } = require('./src/utils/shutdownManager/shutdownManager');

// startDataViewStore(); <<<< this is not used at the moment

const db = require('./src/database/Database')
db.connect();

const app = express();
app.use(express.json());
app.use(cors({
    // origin: 'http://localhost:3001' // for development
}));

registerRoutes(app);

// require('./src/database/debug/mockupData')

app.listen(process.env.DATA_STORAGE_SERVER_PORT, () => {
    logger.log({
        level: 'info',
        message: `DataStorageServer running on port ${process.env.DATA_STORAGE_SERVER_PORT}!`,
    });
});

process.on('SIGINT', gracefulShutdown); // generated by the user; pressing Ctrl+C
process.on('SIGTERM', gracefulShutdown); // sent programmatically or by system administrators. Often used by process managers, like PM2 or systemd, to stop a process.
// Emitted when the Node.js process is about to exit as a result of either:
// The process.exit() method being called explicitly.
// The Node.js event loop not having any additional work to perform.
process.on('exit', gracefulShutdown);