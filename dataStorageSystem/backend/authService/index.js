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

// IMPORTANT! UNCOMMENT THIS IF YOU ARE NOT USING DOCKER. IF YOU ARE USING DOCKER, NGINX HANDLES CORS, OTHERWISE, YOU NEED TO ALLOW IT HERE ( OTHERWISE CERTAIN APPLICATIONS LIKE CALENDAR WONT WORK - CORS POLICY)
//            HOWEVER, IF YOU ARE USING DOCKER, THEN THIS NEEDS TO BE COMMENTED! OTHERWISE, Access-Control-Allow-Origin WILL BE SET TWICE AND BROWSER WILL BLOCK IT !
// app.use(cors({
//     origin: '*',
//     optionsSuccessStatus: 200
// }));

registerRoutes(app);

// require('./src/database/debug/mockupData')

app.listen(process.env.AUTH_SERVICE_PORT, () => {
    logger.log({
        level: 'info',
        message: `Auth service running on port ${process.env.AUTH_SERVICE_PORT}!`,
    });
});