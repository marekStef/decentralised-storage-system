const express = require('express');
const {startDataViewStore} = require('./services/DataViewStoreService');
require('dotenv').config();
const logger = require('./logger/winston');

const dataViewStoreRoutes = require("./routes/dataViewStoreRoutes");

startDataViewStore();

const app = express();

app.use('/api/dataviewstore', dataViewStoreRoutes);

app.listen(process.env.PORT, () => {
    logger.log({
        level: 'info',
        message: `DataStorageServer running on port ${process.env.PORT}!`,
    });
});
