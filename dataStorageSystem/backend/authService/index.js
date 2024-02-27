const express = require('express');
const logger = require('./src/logger/winston');

const app = express();
app.use(express.json());

app.listen(process.env.DATA_STORAGE_SERVER_PORT, () => {
    logger.log({
        level: 'info',
        message: `Auth Service running on port ${process.env.DATA_STORAGE_SERVER_PORT}!`,
    });
});
