const express = require("express");
const router = express.Router();

const eventsController = require("../../controllers/eventsController");

router.post('/uploadNewEvents', eventsController.uploadNewEvents);

router.post('/getFilteredEvents', eventsController.getFilteredEvents);

router.put('/events/:eventId', eventsController.modifyGivenEvent);

router.delete('/events/:eventId', eventsController.deleteGivenEvent);

module.exports = router;