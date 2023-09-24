const express = require("express");
const router = express.Router();
const upload = require('../middleware/upload');
const {createNewDataView} = require("../controllers/dataViewStoreController");

router.post('/create_new_data_view',
    upload.array('files', process.env.MAXIMUM_NUMBER_OF_UPLOADED_FILES_FOR_DATA_VIEWS),
    createNewDataView
);

module.exports = router;