const mongoose = require('mongoose');

const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const eventsRelatedResponseMessages = require('../constants/forApiResponses/eventsRelated');

const EventSchema = require('../database/models/eventRelatedModels/EventSchema');

const mongoDbCodes = require('../constants/mongoDbCodes');
const eventsRelated = require('../constants/forApiResponses/eventsRelated');

const logger = require('../logger/winston');

const isDateInISOFormat = dateVal => {
    const date = new Date(dateVal);
    return !isNaN(date.getTime());
}

const checkRequiredDataInEventAndCheckCorrectMetadataFields = event => {
    // if createdDate is present, check that it's in ISO 8601 format
    if (event.metadata.createdDate && !isDateInISOFormat(event.metadata.createdDate)) {
        throw {
            statusCode: httpStatusCodes.BAD_REQUEST,
            message: eventsRelatedResponseMessages.error.INVALID_CREATED_DATE_FORMAT_MUST_BE_ISO
        };
    }

    if (!event.metadata || event.metadata.profile === undefined || event.metadata.source === undefined) {
        throw {
            statusCode: httpStatusCodes.BAD_REQUEST,
            message: eventsRelatedResponseMessages.error.EVENT_NOT_CONTAINING_CORRECT_METADATA,
        };
    }
}

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event agains profile schema
// saves the event into db
const saveNewEvent = async (session, event) => {
    checkRequiredDataInEventAndCheckCorrectMetadataFields(event);

    try {
        const newEvent = new EventSchema(event);
        await newEvent.save({ session }); // Save using the session for transaction
        return newEvent; // Return the event for later use
    } catch (error) {
        logger.error(error);
        if (error.code == mongoDbCodes.DUPLICATE_ERROR)
            throw {
                statusCode: httpStatusCodes.CONFLICT,
                message: eventsRelated.DUPLICATE,
            };
        else {
            logger.error('Error saving new event:' + error);
            throw {
                statusCode: httpStatusCodes.INTERNAL_SERVER_ERROR,
                message: generalResponseMessages.INTERNAL_SERVER_ERROR,
            };
        }
    }
};

// this is transaction version
const uploadNewEvents_TransactionsVersion = async (req, res) => {
    const { events } = req.body;

    if (!events) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            message: eventsRelatedResponseMessages.error.MISSING_REQUIRED_FIELDS,
        });
    }

	let session = null;
    try {
		session = await mongoose.startSession(); // Start a MongoDB session (!!! needs mongodb with replica to be set - look at readme)
		session.startTransaction(); // Start the transaction

        const savedEvents = await Promise.all(events.map(event => saveNewEvent(session, event)));
        await session.commitTransaction(); // Commit the transaction if all saves succeed

        // Map saved events to include IDs and other necessary data
        // const responseEvents = savedEvents.map(event => ({
        //     id: event._id,
        //     ...event.toJSON(),
        // }));

		// logger.info(savedEvents);

        res.status(httpStatusCodes.CREATED).json({
            message: eventsRelatedResponseMessages.success.EVENTS_CREATED_SUCCESSFULLY,
            events: savedEvents,
        });
    } catch (err) {
		if (session != null)
        	await session.abortTransaction(); // Rollback the transaction on error
        res.status(err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message || generalResponseMessages.ERROR_OCCURED,
        });
        logger.error(err);
    } finally {
		if (session != null)
        	session.endSession(); // End the session whether success or fail
    }
};

const uploadNewEvents_VersionWithoutTransactions = async (req, res) => {
    const { events } = req.body;

    if (!events) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            message: eventsRelatedResponseMessages.error.MISSING_REQUIRED_FIELDS,
        });
    }

    try {
        const savedEvents = await Promise.all(events.map(event => saveNewEvent(null, event)));
        logger.info('savedEvents: ' + savedEvents);

        res.status(httpStatusCodes.CREATED).json({
            message: eventsRelatedResponseMessages.success.EVENTS_CREATED_SUCCESSFULLY,
            events: savedEvents,
        });
    } catch (err) {
        res.status(err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message || generalResponseMessages.ERROR_OCCURED,
        });
        logger.error(err);
    }
};

const getFilteredEvents = async (req, res) => {
	try {
		const {
			payloadMustContain,
			metadataMustContain
		} = req.body;

		// returned events must contain exactly the same values in payload which are specified in payloadMustContain object
		let query = {};
		if (payloadMustContain != null) {
			for (const [key, value] of Object.entries(payloadMustContain)) {
				query[`payload.${key}`] = value;
			}
		}

		if (metadataMustContain != null) {
			for (const [key, value] of Object.entries(metadataMustContain)) {
				query[`metadata.${key}`] = value;
			}
		}

		const events = await EventSchema.find(query);

		res.status(httpStatusCodes.OK).json({
			success: true,
			count: events.length,
			data: events
		});
	} catch (error) {
		logger.error('Error fetching events:' + error);
		res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: eventsRelatedResponseMessages.error.SERVER_ERROR_WHILE_FETCHING_EVENTS
		});
	}
};

const modifyGivenEvent = async (req, res) => {
    const { eventId } = req.params;
    const { modifiedEvent } = req.body;

    try {
        checkRequiredDataInEventAndCheckCorrectMetadataFields(modifiedEvent);
    }
    catch (err) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    
    try {
        const event = await EventSchema.findById(eventId);
        
        if (!event) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({ message: eventsRelatedResponseMessages.error.EVENT_NOT_FOUND });
        }
        
        const updatedEvent = await EventSchema.findByIdAndUpdate(eventId, { $set: modifiedEvent }, { new: true });
        
        res.status(httpStatusCodes.OK).json({ message: eventsRelatedResponseMessages.success.EVENT_UPDATED_SUCCESSFULLY, event: updatedEvent });
    } catch (error) {
        if (error.kind === 'ObjectId' && error.name === 'CastError') {
            // if the eventId is not a valid mongodb ObjectId
            return res.status(httpStatusCodes.BAD_REQUEST).json({ message: eventsRelatedResponseMessages.error.INVALILD_EVENT_ID_FORMAT });
        }

        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: eventsRelatedResponseMessages.error.ERROR_DURING_UPDATE_OF_EVENT, error: error.message });
    }
}

const deleteGivenEvent = async (req, res) => {
    const { eventId } = req.params;
    
    try {
        const deletedEvent = await EventSchema.findByIdAndDelete(eventId);
        
        // no event found
        if (!deletedEvent) {
            return res.status(httpStatusCodes.NOT_FOUND).json({ message: eventsRelatedResponseMessages.error.EVENT_NOT_FOUND });
        }
        
        res.status(httpStatusCodes.OK).json({ message: eventsRelatedResponseMessages.success.EVENT_DELETED_SUCCESSFULLY });
    } catch (error) {
        if (error.kind === 'ObjectId' && error.name === 'CastError') {
            // if the eventId is not a valid mongodb ObjectId
            return res.status(httpStatusCodes.BAD_REQUEST).json({ message: eventsRelatedResponseMessages.error.INVALILD_EVENT_ID_FORMAT });
        }
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: eventsRelatedResponseMessages.error.ERROR_DURING_DELETE_OF_EVENT, error: error.message });
    }
}

module.exports = {
	uploadNewEvents: uploadNewEvents_VersionWithoutTransactions,
	getFilteredEvents,
    modifyGivenEvent,
    deleteGivenEvent
}