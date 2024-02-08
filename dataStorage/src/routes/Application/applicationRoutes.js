const express = require("express");
const router = express.Router();

const {register_new_profile, upload_new_event} = require("../../controllers/applicationController");

router.post('/register_new_profile', register_new_profile);

router.post('/event', upload_new_event);

module.exports = router;