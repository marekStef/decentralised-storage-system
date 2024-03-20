const express = require("express");
const router = express.Router();

const eventsController = require("../../controllers/eventsController");

router.post('/uploadNewEvents', eventsController.uploadNewEvents);

router.post('/get_filtered_events', eventsController.getFilteredEvents);

router.put('/events/:eventId', eventsController.modifyGivenEvent);

router.delete('/events/:eventId', eventsController.deleteGivenEvent);

module.exports = router;