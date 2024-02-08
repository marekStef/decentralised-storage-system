const express = require("express");
const router = express.Router();
const {createNewApp} = require("../../controllers/adminController");

router.post('/register_new_app', createNewApp);

module.exports = router;