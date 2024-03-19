const express = require("express");
const router = express.Router();

const statusInfoController = require("../../controllers/statusInfoController")

router.get('/checks/check_auth_service_presence', statusInfoController.returnAuthServicePresence);

module.exports = router;
