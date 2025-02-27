const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/applicationController");

router.post('/associateWithStorageAppHolder', applicationController.associateAppWithStorageAppHolder);

router.post('/registerNewProfile', applicationController.registerNewProfile);

router.get('/checkAccessTokenStatus', applicationController.isAccessTokenForGivenPermissionRequestActive);

router.post('/requestNewPermission', applicationController.requestNewPermission);

router.post('/uploadNewEvents', applicationController.uploadNewEvents);

router.put('/modifyEvent', applicationController.modifyEvent);

router.delete('/deleteEvent', applicationController.deleteEvent);

router.get('/getAllEventsForGivenAccessToken', applicationController.getAllEventsOfGivenProfile);

// views

router.post('/views/registerNewViewInstanceAccess', applicationController.registerNewViewInstanceAccess);

router.post('/views/runViewInstance', applicationController.runViewInstace);


module.exports = router;