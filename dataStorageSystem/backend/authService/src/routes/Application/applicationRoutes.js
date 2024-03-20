const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/applicationController");

router.post('/associateWithStorageAppHolder', applicationController.associateAppWithStorageAppHolder);

router.post('/register_new_profile', applicationController.registerNewProfile);

router.get('/checkAccessTokenStatus', applicationController.isAccessTokenForGivenPermissionRequestActive);

router.post('/request_new_permissions', applicationController.requestNewPermissions);

router.post('/upload_new_events', applicationController.uploadNewEvents);

router.put('/modify_event', applicationController.modifyEvent);

router.delete('/delete_event', applicationController.deleteEvent);

router.get('/get_all_events_for_given_access_token', applicationController.getAllEventsOfGivenProfile);

router.post('/register_new_view_instance', applicationController.registerNewViewInstance);

router.post('/run_view_instance', applicationController.runViewInstace);


module.exports = router;