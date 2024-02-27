const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const eventsRelatedResponseMessages = require('../constants/forApiResponses/eventsRelated');

const EventSchema = require('../database/models/eventRelatedModels/EventSchema');

const mongoDbCodes = require('../constants/mongoDbCodes');

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event agains profile schema
// saves the event into db
const saveNewEvent = async (res, event) => {
    console.log(event)
    // Validate event against Profile schema
    if (!event.metadata || !event.metadata.profile == undefined|| !event.metadata.source == undefined) {
        console.log("here?")
        throw Error(res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'Event does not contain correct metadata' }));
    }

    try {
        const newEvent = new EventSchema(event);
        await newEvent.save();
    }
    catch (error) {
        console.error('Error saving new event:', error);
        throw Error(res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: generalResponseMessages.INTERNAL_SERVER_ERROR }));
    }
}

const uploadNewEvents = async (req, res) => {
    const { events } = req.body;

    if (!events) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: eventsRelatedResponseMessages.error.MISSING_REQUIRED_FIELDS });
    }

    try {
        await Promise.all(events.map(event => saveNewEvent(res, event)));
        res.status(httpStatusCodes.CREATED).json({ message: eventsRelatedResponseMessages.success.EVENTS_CREATED_SUCCESSFULLY });
    } catch (errResponse) {
        console.log(errResponse);
        console.log("<<<<<<1");
        return errResponse;
    }
};

const getFilteredEvents = async (req, res) => {
    try {
      const { payloadMustContain } = req.body;
  
      // returned events must contain exactly the same values in payload which are specified in payloadMustContain object
      let query = {};
      for (const [key, value] of Object.entries(payloadMustContain)) {
        query[`payload.${key}`] = value;
      }
  
      const events = await EventSchema.find(query);
  
      res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching events'
      });
    }
  };

module.exports = {
    uploadNewEvents,
    getFilteredEvents
}