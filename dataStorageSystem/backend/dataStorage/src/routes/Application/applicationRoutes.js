const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/applicationController");

router.post('/upload_new_events', applicationController.uploadNewEvents);

router.post('/get_filtered_events', applicationController.getFilteredEvents);

router.put('/events/:eventId', applicationController.modifyGivenEvent);

router.delete('/events/:eventId', applicationController.deleteGivenEvent);

module.exports = router;