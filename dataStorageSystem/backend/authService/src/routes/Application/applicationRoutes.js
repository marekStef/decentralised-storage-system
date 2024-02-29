const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/applicationController");

router.post('/associate_with_storage_app_holder', applicationController.associate_app_with_storage_app_holder);

router.post('/register_new_profile', applicationController.register_new_profile);

router.post('/request_new_permissions', applicationController.request_new_permissions);

router.post('/upload_new_events', applicationController.uploadNewEvents);


module.exports = router;