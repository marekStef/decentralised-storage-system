require('dotenv').config();

// Exit if PROJECT_ROOT or DATA_STORAGE_SERVER_PORT environment variable is not set - we cannot continue
if (!process.env.PROJECT_ROOT || !process.env.DATA_STORAGE_SERVER_PORT) {
    console.error("Error: PROJECT_ROOT or DATA_STORAGE_SERVER_PORT environment variable is not set.");
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const registerRoutes = require('./src/routeRegistrar');

const logger = require('./src/logger/winston');

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