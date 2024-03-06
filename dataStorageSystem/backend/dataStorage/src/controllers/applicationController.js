const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const eventsRelatedResponseMessages = require('../constants/forApiResponses/eventsRelated');

const EventSchema = require('../database/models/eventRelatedModels/EventSchema');

const mongoDbCodes = require('../constants/mongoDbCodes');
const eventsRelated = require('../constants/forApiResponses/eventsRelated');

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event agains profile schema
// saves the event into db
const saveNewEvent = async (res, event) => {
	console.log(event)
	// Validate event against Profile schema
	if (!event.metadata || !event.metadata.profile == undefined || !event.metadata.source == undefined) {
		throw Error({
			statusCode: httpStatusCodes.BAD_REQUEST,
			message: 'Event does not contain correct metadata'
		});
	}

	try {
		const newEvent = new EventSchema(event);
		await newEvent.save();
	} catch (error) {
		console.log(error)
		if (error.code == mongoDbCodes.DUPLICATE_ERROR)
			throw Error({
				statusCode: httpStatusCodes.CONFLICT,
				message: eventsRelated.DUPLICATE
			});
		else {
			console.error('Error saving new event:', error);
			throw Error({
				statusCode: httpStatusCodes.INTERNAL_SERVER_ERROR,
				message: generalResponseMessages.INTERNAL_SERVER_ERROR
			});
		}
	}
}

const uploadNewEvents = async (req, res) => {
	const {
		events
	} = req.body;

	if (!events) {
		return res.status(httpStatusCodes.BAD_REQUEST).json({
			message: eventsRelatedResponseMessages.error.MISSING_REQUIRED_FIELDS
		});
	}

	try {
		await Promise.all(events.map(event => saveNewEvent(res, event))); // todo - if something goes wrong in the middle of the work - i should delete the saved events
		res.status(httpStatusCodes.CREATED).json({
			message: eventsRelatedResponseMessages.success.EVENTS_CREATED_SUCCESSFULLY
		});
	} catch (err) {
		res.status(err.statusCode).json({
			message: err.message
		});
		console.log(err);
		console.log("<<<<<<1");
		return err;
	}
};

const getFilteredEvents = async (req, res) => {
	try {
		const {
			payloadMustContain
		} = req.body;

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