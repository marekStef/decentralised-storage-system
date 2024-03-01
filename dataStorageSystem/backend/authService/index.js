require('dotenv').config();
const express = require('express');
const cors = require('cors');
const registerRoutes = require('./src/routeRegistrar');

const logger = require('./src/logger/winston');

// const db = require('./src/database/Database')
// db.connect();

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