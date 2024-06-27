const mongoose = require('mongoose');

const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const eventsRelatedResponseMessages = require('../constants/forApiResponses/eventsRelated');

const EventSchema = require('../database/models/eventRelatedModels/EventSchema');

const mongoDbCodes = require('../constants/mongoDbCodes');
const eventsRelated = require('../constants/forApiResponses/eventsRelated');

const logger = require('../logger/winston');

/**
 * Checks if a given date value is in a valid ISO format.
 *
 * @param {string} dateVal - The date value to be checked.
 * @returns {boolean} - Returns `true` if the date value is in a valid ISO format, otherwise `false`.
 *
 */
const isDateInISOFormat = dateVal => {
    const date = new Date(dateVal);
    return !isNaN(date.getTime());
}

/**
 * Checks required data in an event and validates correct metadata fields.
 * 
 * This function performs the following checks:
 * 1. If `createdDate` is present in the event's metadata, it verifies that `createdDate` is in ISO 8601 format.
 * 2. Ensures that the event's metadata contains both `profile` and `source` fields.
 * 
 * @param {Object} event - The event object to be validated.
 * @param {Object} event.metadata - The metadata object of the event.
 * @param {string} [event.metadata.createdDate] - The creation date of the event in ISO 8601 format.
 * @param {string} [event.metadata.profile] - The profile information in the event's metadata.
 * @param {string} [event.metadata.source] - The source information in the event's metadata.
 * 
 * @throws {Object} Throws an error if the `createdDate` is not in ISO format with the following structure:
 * {
 *   statusCode: number,
 *   message: string
 * }
 * @throws {Object} Throws an error if the `profile` or `source` fields are missing in the event's metadata with the following structure:
 * {
 *   statusCode: number,
 *   message: string
 * }
 */
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

/**
 * Saves a new event into the database.
 * 
 * This function performs the following actions:
 * 1. Checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter.
 * 2. Validates the event against the profile schema.
 * 3. Saves the event into the database using a session for transaction.
 * 
 * @param {Object} session - The session object for database transaction.
 * @param {Object} event - The event object to be saved.
 * 
 * @returns {Promise<Object>} The newly saved event object.
 * 
 * @throws {Object} Throws an error if there is a validation or database error with the following structure:
 * {
 *   statusCode: number,
 *   message: string
 * }
 */
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

/**
 * Uploads new events using a MongoDB transaction mechanism.
 * @param {Object} req - The request object ( must contain `req.body.events` - The array of event objects to be saved).
 * @param {Object} res - The response object.
 * 
 * @returns Sends a JSON response with the status and message.
 */
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

/**
 * Uploads new events without using MongoDB transaction mechanism.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns Sends a JSON response with the status and message.
 */
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

/**
 * Retrieves filtered events based on the specified criteria.
 * 
 * This function performs the following actions:
 * 1. Extracts the `payloadMustContain` and `metadataMustContain` filters from the request body.
 * 2. Constructs a query object to match events that meet the specified criteria.
 * 3. Retrieves the events from the database that match the query.
 * 4. Sends a response with the filtered events or an error message.
 * 
 * @param {Object} req - The request object containing req.body.payloadMustContain and req.body.metadataMustContain
 * @param {Object} res - The response object.
 * 
 * @returns Sends a JSON response with the status, success flag, count, and data or an error message.
 */
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

/**
 * @function modifyGivenEvent
 * @description Modifies an existing event based on the provided event ID and modified event data.
 * 
 * @param {Object} req - The request object (containing `req.params.eventId` and `req.body.modifiedEvent` - modified event data).
 * @param {Object} res - The response object.
 * 
 * @returns Sends an appropriate HTTP response based on the outcome of the event modification.
 */
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

/**
 * @function deleteGivenEvent
 * @description Deletes an existing event based on the provided event ID.
 * 
 * @param {Object} req - The request object ( must contain req.params.eventId - the ID of the event to delete).
 * @param {Object} res - The response object.
 * 
 * @returns Sends an appropriate HTTP response based on the outcome of the event deletion.
 */
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