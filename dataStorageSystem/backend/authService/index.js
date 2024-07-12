require('dotenv').config();

// Exit if PROJECT_ROOT or AUTH_SERVICE_PORT environment variable is not set - we cannot continue
if (!process.env.PROJECT_ROOT || !process.env.AUTH_SERVICE_PORT) {
    console.error("Error: PROJECT_ROOT or AUTH_SERVICE_PORT environment variable is not set.");
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

app.listen(process.env.AUTH_SERVICE_PORT, () => {
    logger.log({
        level: 'info',
        message: `Auth service running on port ${process.env.AUTH_SERVICE_PORT}!`,
    });
});