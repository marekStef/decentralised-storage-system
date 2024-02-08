const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/applicationController");

router.post('/associate_with_storage_app_holder', applicationController.associate_app_with_storage_app_holder);

router.post('/register_new_profile', applicationController.register_new_profile);

router.post('/event', applicationController.upload_new_event);

module.exports = router;