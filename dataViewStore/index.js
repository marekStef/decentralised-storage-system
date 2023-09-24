//region Imports
const express = require('express');
const fs = require('fs');
const path = require('path');
const DataViewStore = require('./src/models/DataViewStore');
const {setDataViewStoreServerAddress, getDataViewStoreServerAddress} = require("./src/configuration/configuration");
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dataViewRoutes = require('./src/routes/dataViewRoutes')
//endregion

//region Run Upon Start
const app = express();
app.use(express.json()); 

const dataViewStore = new DataViewStore();
dataViewStore.start();
//endregion

app.use('/', dataViewRoutes);

const port = process.env.DATA_VIEW_STORE_SERVER_PORT || 3001;

app.listen(port, () => {
    setDataViewStoreServerAddress(`http://localhost:${process.env.DATA_VIEW_STORE_SERVER_PORT}`);

    console.log(`DataViewStore server running on ${getDataViewStoreServerAddress()}`);
    if (process && process.send) {
        process.send({ type: 'dataViewStoreServerUrl', url: getDataViewStoreServerAddress() });
    }
});
