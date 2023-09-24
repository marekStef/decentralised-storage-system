const express = require('express');
const router = express.Router();

const {createNewDataView, runDataViewFunction} = require("../controllers/dataViewController");

router.post('/createNewDataView', createNewDataView);

router.get('/runFunction/:appId/:viewId', runDataViewFunction);

module.exports = router;