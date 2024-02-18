const express = require("express");
const router = express.Router();

const statusInfoController = require("../../controllers/statusInfoController")

router.get('/checks/check_data_storage_presence', statusInfoController.returnDataStoragePresence);

module.exports = router;
