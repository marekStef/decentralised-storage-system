const mongoose = require('mongoose');
const axios = require('axios');

const logger = require('../logger/winston');

const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const applicationResponseMessages = require('../constants/forApiResponses/application/responseMessages');

const {generateBadResponse} = require('./helpers/generalHelpers');
const {generateJwtToken, decodeJwtToken} = require('./helpers/jwtGenerator');

const ApplicationSchema = require('../database/models/applicationRelatedModels/ApplicationSchema');
const OneTimeAssociationToken = require('../database/models/applicationRelatedModels/OneTimeAssociationTokenForApplication');
const DataAccessPermissionSchema = require('../database/models/dataAccessRelatedModels/DataAccessPermissionSchema');
const ViewAccessSchema = require('../database/models/viewsRelatedModels/ViewAccessSchema');

const DataStorage = require('../externalComponents/DataStorage')

const mongoDbCodes = require('../constants/mongoDbCodes');
const {validateJsonSchema, isValidJSON} = require('./helpers/jsonSchemaValidation');
const { compareObjects } = require('./helpers/hashing');
const authServiceSpecificCodes = require('../constants/authServiceSpecificCodes');

const { generateTokenForViewAccess, decodeTokenForViewAccess } = require('./helpers/viewAccessHelpers');

// constants for data storage component endpoints

const DATA_STORAGE_ENDPOINT_FOR_UPLOADING_NEW_EVENTS = 'app/api/uploadNewEvents';
const DATA_STORAGE_ENDPOINT_FOR_GETTING_FILTERED_EVENTS = 'app/api/getFilteredEvents';

const getEndpointForViewManagerViewInstanceCreation = () => `${process.env.VIEW_MANAGER_URL}/viewInstances/createNewViewInstance`;
const getEndpointForViewManagerViewInstanceRunning = () => `${process.env.VIEW_MANAGER_URL}/viewInstances/runViewInstance`;

const is_given_app_holder_already_associated_with_real_app = appHolder => appHolder.dateOfAssociationByApp !== null;

/**
 * Associates an application with a storage app holder using an association token.
 * 
 * It validates the input, checks the existence and validity
 * of the association token, ensures the app holder has not already been associated,
 * and generates a JWT token for permission requests and profiles.
 * @async
 * @function associateAppWithStorageAppHolder
 * @param {Object} req - Express request object containing `req.body.associationTokenId` - The ID of the association token and `req.body.nameDefinedByApp` - The name defined by the app.
 * @param {Object} res - Express response object.
 */
const associateAppWithStorageAppHolder = async (req, res) => {
    const {associationTokenId, nameDefinedByApp} = req.body;

    if (!associationTokenId || !nameDefinedByApp)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.ASSOCIATION_TOKEN_OR_NAME_MISSING);

    if (!mongoose.Types.ObjectId.isValid(associationTokenId))
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.INVALID_ASSOCIATION_TOKEN);

    // // DELETE - ONLY FOR DEBUGGING!
    // const jwtPayload = {
    //     appId: "appHolder._id",
    //     nameDefinedByUser: "appHolder.nameDefinedByUser",
    //     nameDefinedByApp
    // };
    // const generatedJwtToken = generateJwtToken(jwtPayload);
    // res.status(httpStatusCodes.OK).json({
    //     message: applicationResponseMessages.success.APP_ASSOCIATED_WITH_STORAGE_APP_HOLDER,
    //     app: "appHolder", // remove when deployed,
    //     jwtTokenForPermissionRequestsAndProfiles: generatedJwtToken
    // });
    // return;
    // // END OF DELETE - ONLY FOR DEBUGGING!

    try {
        // Find the association token
        const token = await OneTimeAssociationToken.findById(associationTokenId).populate('app');

        if (!token) // check whether the token actually exists
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.INVALID_ASSOCIATION_TOKEN);

        // Check if the app holder in the storage system exists and hasn't been associated yet
        const appHolder = token.app;
        if (!appHolder)
            return generateBadResponse(res, httpStatusCodes.NOT_FOUND, applicationResponseMessages.error.APP_HOLDER_DOES_NOT_EXIST_IN_THE_SYSTEM);

        if (is_given_app_holder_already_associated_with_real_app(appHolder)) {
            // this condition should never happen as the token should never be administered when the app is already associated and if not, the token after association is automatically deleted from the system
            // nevertheless, for the sake of completness I put it here
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.APP_HOLDER_ALREADY_ASSOCIATED);
        }

        // Before updating appHolder, check if nameDefinedByApp is already in use
        // const existingAppWithSameName = await ApplicationSchema.findOne({nameDefinedByApp});
        // if (existingAppWithSameName && existingAppWithSameName._id.toString() !== appHolder._id.toString()) {
        //     return generateBadResponse(res, httpStatusCodes.CONFLICT, applicationResponseMessages.error.APP_NAME_CONFLICT);
        // }

        // jwtTokenForPermissionRequestsAndProfiles
        const jwtPayload = {
            appId: appHolder._id,
            nameDefinedByUser: appHolder.nameDefinedByUser,
            nameDefinedByApp
        };
        const generatedJwtToken = generateJwtToken(jwtPayload);

        // Update the app with the provided name and the association date
        appHolder.nameDefinedByApp = nameDefinedByApp;
        appHolder.dateOfAssociationByApp = new Date();
        appHolder.jwtTokenForPermissionRequestsAndProfiles = generatedJwtToken;
        await appHolder.save(); // possible conflic excpetion here - (DUPLICATE_ERROR) due to nameDefinedByApp

        // Delete the used association token
        await OneTimeAssociationToken.findByIdAndDelete(associationTokenId);

        res.status(httpStatusCodes.OK).json({
            message: applicationResponseMessages.success.APP_ASSOCIATED_WITH_STORAGE_APP_HOLDER,
            app: appHolder, // remove when deployed,
            jwtTokenForPermissionRequestsAndProfiles: generatedJwtToken
        });

    } catch (error) {
        // if (error.code === mongoDbCodes.DUPLICATE_ERROR) {
        //     return generateBadResponse(res, httpStatusCodes.CONFLICT, applicationResponseMessages.error.APP_NAME_CONFLICT);
        // }

        logger.error('Error associating app with storage app holder:' + error);
        generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Registers a new profile using provided metadata and payload.
 * 
 * @async
 * @function registerNewProfile
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.jwtTokenForPermissionRequestsAndProfiles - JWT token for permissions requests and profiles.
 * @param {Object} req.body.metadata - Metadata for the new profile.
 * @param {Object} req.body.payload - Payload for the new profile.
 * @param {string} req.body.payload.profile_name - Name of the profile.
 * @param {Object} req.body.payload.json_schema - JSON schema for the profile.
 * @param {Object} res - Express response object.
 * 
 */
const registerNewProfile = async (req, res) => {
    let {jwtTokenForPermissionRequestsAndProfiles, metadata, payload} = req.body;
    if (!jwtTokenForPermissionRequestsAndProfiles|| !metadata || !payload || payload.profile_name == undefined || payload.json_schema == undefined)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.MISSING_REQUIRED_FIELDS);

    let decodedToken;
    try {
        decodedToken = decodeJwtToken(jwtTokenForPermissionRequestsAndProfiles);
    } catch (error) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({message: applicationResponseMessages.error.INVALID_OR_EXPIRED_JWT_TOKEN});
    }

    const {nameDefinedByApp} = decodedToken;

    // checking profile uniquness - such profile cannot exist
    try {
        const {code, body} = await DataStorage.getProfileFromDataStorage(payload.profile_name)
        if (body.count != 0) {
            const existingProfileEvent = body.data[0];

            // console.log(body.data[0].payload, '-----', payload)
            // there is already some profile registered under the same unique name
            // try to compute hashes of the payloads and if they match return CREATED http status code
            if (compareObjects(existingProfileEvent.payload, payload)) {
                return res.status(httpStatusCodes.CREATED).json({
                    message: applicationResponseMessages.success.NEW_PROFILE_REGISTERED,
                    code: authServiceSpecificCodes.profileCodes.ALREADY_EXISING_WITH_SAME_SCHEMA
                });
            } else {
                // profiles do not match - unable to do anything now
                return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.PROFILE_NAME_MUST_BE_UNIQUE);
            }
        }
    }
    catch ({code, message}) {
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, message);
    } 

    metadata = {
        ...metadata,
        acceptedDate: new Date().toISOString(),
        source: nameDefinedByApp
    };

    try {
        const {code, body} = await DataStorage.getProfileFromDataStorage(metadata.profile)
        if (body.count != 1) {
            return generateBadResponse(res, httpStatusCodes.NOT_FOUND, applicationResponseMessages.error.PROFILE_DOES_NOT_EXIST);
        }
        const jsonSchema = body.data[0].payload.json_schema

        let isNewProfileEventValid = validateJsonSchema(jsonSchema, {metadata, payload});
        if (!isNewProfileEventValid) {
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.JSON_VALIDATION_ERROR);
        }
    }
    catch (err) {
        logger.error('error registering new profile: ' + err);
        // {code, message}
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    } 

    const newProfileEvent = {
        metadata,
        payload
    };

    try {
        const {code, message} = await DataStorage.sendEventsToDataStorage([newProfileEvent])
        if (code === httpStatusCodes.CREATED) {
            logger.info('Event uploaded successfully:' + message);
        } else {
            // Other status codes except for 500
            logger.error('Unexpected response status:' + code);
            throw new Error('Unexpected response status: ' + code);
        }
    }
    catch (err) {
        if (err?.code == httpStatusCodes.CONFLICT)
            return generateBadResponse(res, httpStatusCodes.CONFLICT, generalResponseMessages.DUPLICATE_ERROR)
        logger.error('Error registering new profile:' + err);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    }

    res.status(httpStatusCodes.CREATED).json({
        message: applicationResponseMessages.success.NEW_PROFILE_REGISTERED,
        // profile: newProfile
    });
};

/**
 * Requests new permission for an application using a JWT token.
 * 
 * @async
 * @function requestNewPermission
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.jwtTokenForPermissionRequestsAndProfiles - JWT token for permission request.
 * @param {Object} req.body.permissionsRequest - Requested permission.
 * @param {string} req.body.permissionsRequest.profile - Profile for which the permission is requested.
 * @param {boolean} [req.body.permissionsRequest.read] - Read permission.
 * @param {boolean} [req.body.permissionsRequest.create] - Create permission.
 * @param {boolean} [req.body.permissionsRequest.modify] - Modify permission.
 * @param {boolean} [req.body.permissionsRequest.delete] - Delete permission.
 * @param {string} [req.body.requestMessage] - Optional message for the permission request.
 * @param {Object} res - Express response object.
 */
const requestNewPermission = async (req, res) => {
    const { jwtTokenForPermissionRequestsAndProfiles, permissionsRequest, requestMessage } = req.body;

    if (!jwtTokenForPermissionRequestsAndProfiles)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.JWT_TOKEN_REQUIRED);

    let decodedToken;
    try {
        decodedToken = decodeJwtToken(jwtTokenForPermissionRequestsAndProfiles);
    } catch (error) {
        return generateBadResponse(res, httpStatusCodes.UNAUTHORIZED, applicationResponseMessages.error.INVALID_OR_EXPIRED_JWT_TOKEN);
    }

    const { appId } = decodedToken;

    if (!permissionsRequest)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.INVALID_PERMISSIONS_REQUESTS_FORMAT);

    if (!permissionsRequest.profile) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.PERMISSION_REQUEST_MISSING_REQUIRED_FIELDS);
    }

    // Create and save a new DataAccessToken with the requested permission
    try {
        const newDataAccesToken = new DataAccessPermissionSchema({
            app: appId,
            permission: {
                profile: permissionsRequest.profile,
                read: permissionsRequest.read || false,
                create: permissionsRequest.create || false,
                modify: permissionsRequest.modify || false,
                delete: permissionsRequest.delete || false
            },
            createdDate: new Date(),
            requestMessage: requestMessage || "-"
        });

        await newDataAccesToken.save();

        // Generate a new JWT token for this permission
        const tokenPayload = {
            dataAccessPermissionId: newDataAccesToken._id,
            appId: appId,
            permission: permissionsRequest,
            createdDate: newDataAccesToken.createdDate,
            approvedDate: newDataAccesToken.approvedDate,
            expirationDate: newDataAccesToken.expirationDate
        };
        const newGeneratedAccessJwtToken = generateJwtToken(tokenPayload)

        newDataAccesToken.accessToken = newGeneratedAccessJwtToken;
        await newDataAccesToken.save();

        res.status(httpStatusCodes.CREATED).json({
            message: applicationResponseMessages.success.PERMISSIONS_REQUESTED_SUCCESS,
            generatedAccessToken: newGeneratedAccessJwtToken
        });
    } catch (error) {
        logger.error('Error requesting new permissions:' + error);
        generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    }
};

/**
 * Checks if an access token for a given permission request is active.
 * 
 * @async
 * @function isAccessTokenForGivenPermissionRequestActive
 * @param {Object} req - Express request object.
 * @param {Object} req.query - The request query parameters.
 * @param {string} req.query.accessToken - The access token to be checked.
 * @param {Object} res - Express response object.
 * 
 * @returns Returns a JSON response with the status of the access token.
 */
const isAccessTokenForGivenPermissionRequestActive = async (req, res) => {
    const { accessToken } = req.query;

    if (!accessToken)
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: applicationResponseMessages.error.MISSING_REQUIRED_FIELDS });

    let decodedToken;
    try {
        decodedToken = decodeJwtToken(accessToken);
    } catch (error) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({ message: applicationResponseMessages.error.INVALID_OR_EXPIRED_ACCESS_TOKEN });
    }

    const { dataAccessPermissionId } = decodedToken;

    const dataAccessPermission = await DataAccessPermissionSchema.findById(dataAccessPermissionId).populate('app');
    const isActive = dataAccessPermission && dataAccessPermission.isActive;
    const isRevoked = dataAccessPermission && dataAccessPermission.revokedDate != null;

    return res.status(httpStatusCodes.OK).json({
        isActive,
        isRevoked
    })
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

const getSchemaFromDataStorageComponentBasedOnSchemaName = async schemaName => {
    try {
        const {code, body} = await DataStorage.getProfileFromDataStorage(schemaName);
        if (body.count == 1) {
            return body.data[0].payload.json_schema;
        } else {
            throw new ValidationError(applicationResponseMessages.error.PROFILE_NOT_FOUND);
        }
    } catch (err) {
        throw new ValidationError(applicationResponseMessages.error.PROFILE_NOT_FOUND);
    }
}

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event against profile schema
const transformEvent = (profileNeededToBePresentInAllEvents, event, sourceAppName, profileSchemaToValidateEventPayloadAgainst) => {
    // Validate event against Profile schema
    if (!event.metadata || !event.metadata.profile) {
        throw new ValidationError(applicationResponseMessages.error.EVENT_NOT_CONTAINING_CORRECT_METADATA);
    }

    if (!event.payload) {
        throw new ValidationError(applicationResponseMessages.error.EVENT_NOT_CONTAINING_PAYLOAD);
    }

    if (event.metadata.profile != profileNeededToBePresentInAllEvents) {
        throw new ValidationError(applicationResponseMessages.error.ONE_OF_THE_EVENTS_OF_THE_SAME_TYPE_HAS_DIFFERENT_PROFILE);
    }

    if (!validateJsonSchema(profileSchemaToValidateEventPayloadAgainst, event.payload)) {
        throw new ValidationError(applicationResponseMessages.error.EVENT_PAYLOAD_DOES_NOT_MATCH_PROFILE_SCHEMA);
    }

    return {
        ...event,
        metadata: {
            ...event.metadata,
            source: sourceAppName
        }
    };
}

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event agains profile schema
const transformEvents = async (profileNeededToBePresentInAllEvents, events, sourceAppName) => {
    const profileSchemaToValidateEventPayloadAgainst = await getSchemaFromDataStorageComponentBasedOnSchemaName(profileNeededToBePresentInAllEvents);
    return events.map(event => transformEvent(profileNeededToBePresentInAllEvents, event, sourceAppName, profileSchemaToValidateEventPayloadAgainst));
}

// sends events to dataStorage component
const sendEventsToDataStorage = async (res, events) => {
    try {
        const response = await axios.post(`${process.env.DATA_STORAGE_URL}/${DATA_STORAGE_ENDPOINT_FOR_UPLOADING_NEW_EVENTS}`, {
            events: events
        });

        if (response.status === httpStatusCodes.CREATED) {
            logger.info('Event uploaded successfully:' + response.data);
            return res.status(httpStatusCodes.CREATED).json({ message: response.data.message, events: response.data.events });
        } else {
            // Other status codes except for 500
            logger.error('Unexpected response status:' + response.status);
            throw new Error('Unexpected response status: ' + response.status);
        }
    } catch (error) {
        logger.error('Error uploading new event:' + error);

        if (error.response && error.response.status === httpStatusCodes.INTERNAL_SERVER_ERROR) {
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.INTERNAL_SERVER_ERROR_AT_DATA_STORAGE_COMPONENT });
        } else {
            // network issue
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.INTERNAL_SERVER_ERROR_WHILE_SENDING_EVENTS });
        }
    }
}

const decodeAccessToken = accessToken => {
    try {
        return decodeJwtToken(accessToken);
    } catch (error) {
        return null;
    }
}

const getDataAcessPermission = async dataAccessPermissionId => {
    const dataAccessPermission = await DataAccessPermissionSchema.findById(dataAccessPermissionId).populate('app');
    if (!dataAccessPermission || !dataAccessPermission.isActive) {
        return null;
    }

    return dataAccessPermission;
}

const uploadNewEvents = async (req, res) => {
    const { accessToken, profileCommonForAllEventsBeingUploaded, events } = req.body;

    // if (!accessToken || !payload || !metadata || !metadata.profile) {
    if (!accessToken || !profileCommonForAllEventsBeingUploaded || !events) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: applicationResponseMessages.error.MISSING_REQUIRED_FIELDS });
    }

    // Decode JWT accessToken
    let decodedToken = decodeAccessToken(accessToken);
    if (decodedToken == null) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({ message: applicationResponseMessages.error.INVALID_OR_EXPIRED_ACCESS_TOKEN });
    }

    const { dataAccessPermissionId } = decodedToken;

    // Validate DataAccessToken
    const dataAccessPermission = await getDataAcessPermission(dataAccessPermissionId);

    if (dataAccessPermission == null) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.ACCESS_PERMISSION_NOT_ACTIVE_OR_REVOKED });
    }

    // Check for create permission
    const hasCreatePermission = dataAccessPermission.permission.profile == profileCommonForAllEventsBeingUploaded && dataAccessPermission.permission.create == true;
    if (!hasCreatePermission) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.NO_CREATE_PERMISSION_FOR_EVENT_CREATION });
    }

    let sourceAppName = dataAccessPermission.app.nameDefinedByUser

    // add the events

    let updatedEvents;
    try {
        updatedEvents = await transformEvents(profileCommonForAllEventsBeingUploaded, events, sourceAppName)
    }
    catch (errResponse) {
        if (errResponse instanceof ValidationError) {
            console.error("Validation error:", errResponse.message);
            return res.status(httpStatusCodes.BAD_REQUEST).json({ message: errResponse.message });
        }
        else {
            logger.error('uploading new events: ' + errResponse)
            return res.status(errResponse.statusCode).json({ message: errResponse.message })
        }
    }

    try {
        await sendEventsToDataStorage(res, updatedEvents)
    } catch (errResponse) {
        logger.error(errResponse);
        return errResponse;
    }
};

const modifyEvent = async (req, res) => {
    const { eventId, modifiedEvent, accessToken } = req.body;

    if (!eventId || !modifiedEvent || !accessToken) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'eventId, modifiedEvent and accessToken are required in the request' });
    }

    let decodedToken = decodeAccessToken(accessToken);
    if (decodedToken == null) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({ message: applicationResponseMessages.error.INVALID_OR_EXPIRED_ACCESS_TOKEN });
    }

    const dataAccessPermission = await getDataAcessPermission(decodedToken.dataAccessPermissionId);

    if (dataAccessPermission == null) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.ACCESS_PERMISSION_NOT_ACTIVE_OR_REVOKED });
    }

    const hasModifyPermission = dataAccessPermission.permission.profile == modifiedEvent.metadata?.profile && dataAccessPermission.permission.modify == true;
    if (!hasModifyPermission) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.NO_MODIFY_PERMISSION_FOR_EVENT_CREATION });
    }

    let sourceAppName = dataAccessPermission.app.nameDefinedByUser
    modifiedEvent.metadata.source = sourceAppName;

    try {
        const response = await axios.put(`${process.env.DATA_STORAGE_URL}/app/api/events/${eventId}`, {
            modifiedEvent
        });

        if (response.status === httpStatusCodes.OK) {
            logger.info('Event modified successfully:' + response.data);
            return res.status(httpStatusCodes.OK).json({ message: response.data.message, event: response.data.event });
        } else {
            // Other status codes except for 500
            logger.error('Unexpected response status:' + response.status);
            throw new Error('Unexpected response status: ' + response.status);
        }
    } catch (error) {
        logger.error('Error modifying event:' + error.response.data);
        if (error.response && error.response.data != null && error.response.data.message != null) {
            return res.status(error.response.status).json({ message: error.response.data.message });
        } else {
            // network issue
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.INTERNAL_SERVER_ERROR_WHILE_SENDING_EVENTS });
        }
    }
}

const deleteEvent = async (req, res) => {
    const { eventId, accessToken } = req.body;

    if (!eventId || !accessToken) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: applicationResponseMessages.error.EVENT_ID_AND_ACCESS_TOKEN_REQUIRED });
    }

    let decodedToken = decodeAccessToken(accessToken);
    if (decodedToken == null) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({ message: applicationResponseMessages.error.INVALID_OR_EXPIRED_ACCESS_TOKEN });
    }

    const dataAccessPermission = await getDataAcessPermission(decodedToken.dataAccessPermissionId);

    if (dataAccessPermission == null) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.ACCESS_PERMISSION_NOT_ACTIVE_OR_REVOKED });
    }

    const hasDeletePermission = dataAccessPermission.permission.delete == true; // possible improvement of security would be to fetch the event first from dataStorage and check its profile but I assume the id is too difficult to guess
    if (!hasDeletePermission) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.NO_DELETE_PERMISSION_FOR_EVENT_CREATION });
    }

    try {
        const response = await axios.delete(`${process.env.DATA_STORAGE_URL}/app/api/events/${eventId}`);

        if (response.status === httpStatusCodes.OK) {
            logger.info('Event deleted successfully:' + response.data);
            return res.status(httpStatusCodes.OK).json({ message: response.data.message });
        } else {
            // Other status codes except for 500
            logger.error('Unexpected response status:' + response.status);
            throw new Error('Unexpected response status: ' + response.status);
        }
    } catch (error) {
        logger.error('Error modifying event:' + error.response.data);
        if (error.response && error.response.data != null && error.response.data.message != null) {
            return res.status(error.response.status).json({ message: error.response.data.message });
        } else {
            // network issue
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.INTERNAL_SERVER_ERROR_WHILE_SENDING_EVENTS });
        }
    }
}

const getAllEventsOfGivenProfile = async (req, res) => {
    const { accessToken } = req.query;

    if (!accessToken) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: applicationResponseMessages.error.MISSING_REQUIRED_FIELDS });
    }

    // Decode JWT accessToken
    let decodedToken;
    try {
        decodedToken = decodeJwtToken(accessToken);
    } catch (error) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({ message: applicationResponseMessages.error.INVALID_OR_EXPIRED_ACCESS_TOKEN });
    }

    const { dataAccessPermissionId } = decodedToken;

    const dataAccessPermission = await DataAccessPermissionSchema.findById(dataAccessPermissionId).populate('app');
    if (!dataAccessPermission || !dataAccessPermission.isActive) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.ACCESS_PERMISSION_NOT_ACTIVE_OR_REVOKED });
    }

    const hasCreatePermission = dataAccessPermission.permission.read == true;
    if (!hasCreatePermission) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.NO_READ_PERMISSION_FOR_EVENT });
    }

    // let sourceAppName = dataAccessPermission.app.nameDefinedByApp

    try {
        const response = await axios.post(`${process.env.DATA_STORAGE_URL}/${DATA_STORAGE_ENDPOINT_FOR_GETTING_FILTERED_EVENTS}`, {
            metadataMustContain: {
                profile: dataAccessPermission.permission.profile,
                // source: dataAccessPermission.app.nameDefinedByUser
            }
        });

        if (response.status == httpStatusCodes.OK) {
            // logger.info('Event received successflly:' + response.data);
            return res.status(httpStatusCodes.OK).json({ events: response.data.data, count: response.data.count });
        } else {
            // Other status codes except for 500
            logger.error('Unexpected response status:' + response);
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.COULD_NOT_FETCH_EVENTS });
        }
    } catch (error) {
        logger.error('Error fetching events:' + error);

        if (error.response && error.response.status === httpStatusCodes.INTERNAL_SERVER_ERROR) {
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.COULD_NOT_FETCH_EVENTS });
        } else {
            // network issue
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.COULD_NOT_FETCH_EVENTS });
        }
    }
}

const checkWhetherAppWithGivenIdExists = async (appId) => {
    try {
        const app = await ApplicationSchema.findById(appId);
        return app != null;
    }
    catch (err) {
        return false;
    }
}

const registerNewViewInstanceAccess = async (req, res) => {
    const { viewAccessName, viewTemplateId, jwtTokenForPermissionRequestsAndProfiles, configuration } = req.body;

    if (!viewTemplateId | !jwtTokenForPermissionRequestsAndProfiles || !configuration || !viewAccessName) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'viewTemplateId, jwtTokenForPermissionRequestsAndProfiles, viewAccessName and configuration are required' });
    }

    let decodedToken;
    try {
        decodedToken = decodeJwtToken(jwtTokenForPermissionRequestsAndProfiles);
    } catch (error) {
        return generateBadResponse(res, httpStatusCodes.UNAUTHORIZED, applicationResponseMessages.error.INVALID_OR_EXPIRED_JWT_TOKEN);
    }

    const { appId } = decodedToken;

    if (!checkWhetherAppWithGivenIdExists(appId)) {
        return generateBadResponse(res, httpStatusCodes.UNAUTHORIZED, applicationResponseMessages.error.INVALID_OR_EXPIRED_JWT_TOKEN);
    }

    let responseFromViewManager = null;

    try {
        responseFromViewManager = await axios.post(getEndpointForViewManagerViewInstanceCreation(), {
            viewTemplateId,
            jwtTokenForPermissionRequestsAndProfiles,
            configuration
        });

        if (responseFromViewManager.status != httpStatusCodes.CREATED) {
            // Other status codes except for 500
            logger.error('Unexpected response status:' + response);
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: response.data.message });
        }
    } catch (error) {
        logger.error('Error creating new view instance:' + error);
        if (error.response && error.response.data && error.response.data.message) {
            logger.error('Error from js execution service:' + error.response.data.message);
            return res.status(error.response.status).send({message: error.response.data.message});
        } else {
            logger.error('Network or other error:' + error.message);
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: applicationResponseMessages.error.FAILED_TO_CREATE_NEW_VIEW_INSTANCE });
        }
    }

    viewInstanceId = responseFromViewManager.data._id;

    try {
        const viewAccess = new ViewAccessSchema({
            viewAccessName,
            app: appId,
            viewInstanceId,
        });
    
        await viewAccess.save();

        const viewAccessToken = generateTokenForViewAccess(viewInstanceId, appId, viewAccess._id);

        await ViewAccessSchema.findByIdAndUpdate(viewAccess._id, { $set: { viewAccessToken } });

        return res.status(httpStatusCodes.CREATED).json({ viewAccessToken, message: applicationResponseMessages.success.NEW_VIEW_INSTANCE_REGISTERED_SUCCESSFULLY });
    }
    catch (err) {
        logger.error(err);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong during saving of new view instance in auth service. Instance was created in view manager though.' });
        // suggestion: it could be deleted from a view manager but it's not necessarily a necessity 
    }
}

const checkWhetherAccessInstanceWithGivenIdExistsAndMatchesWithViewInstanceInViewManager = async (viewAccessId, viewInstanceId) => {
    try {
        const viewAccess = await ViewAccessSchema.findById(viewAccessId);
        if (viewAccess == null)
            return false;
        return viewAccess.viewInstanceId == viewInstanceId;
    }
    catch (err) {
        return false;
    }
}

const runViewInstace = async (req, res) => {
    const { viewAccessToken, clientCustomData } = req.body;
    if (!viewAccessToken || !clientCustomData) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: applicationResponseMessages.error.VIEW_ACCESS_TOKEN_AND_CLIENT_CUSTOM_DATA_REQUIRED });
    }

    let decodedToken;
    try {
        decodedToken = decodeTokenForViewAccess(viewAccessToken);
    } catch (error) {
        return generateBadResponse(res, httpStatusCodes.UNAUTHORIZED, applicationResponseMessages.error.INVALID_OR_EXPIRED_JWT_TOKEN);
    }

    const {viewInstanceId, appId, authServiceViewAccessId} = decodedToken;

    if (!checkWhetherAccessInstanceWithGivenIdExistsAndMatchesWithViewInstanceInViewManager(authServiceViewAccessId, viewInstanceId)) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({ message: applicationResponseMessages.error.VIEW_DOES_NOT_EXIST });
    }

    let responseFromViewManager = null;
    try {
        responseFromViewManager = await axios.post(getEndpointForViewManagerViewInstanceRunning(), {
            viewInstanceId,
            clientCustomData,
        });

        if (responseFromViewManager.status != httpStatusCodes.OK) {
            logger.error('Unexpected response status:' + response);
            return res.status(responseFromViewManager.status).json({ message: responseFromViewManager.data.message });
        }

        return res.status(httpStatusCodes.OK).json({ ...responseFromViewManager.data })
    } catch (error) {
        logger.error('Error during running of view instance:' + error);
        if (error.response && error.response.data && error.response.data.message) {
            logger.error('Error from view manager:' + error.response.data.message);
            res.status(error.response.status).send({message: error.response.data.message, sourceError: 'error comes from view manager component' });
        } else {
            logger.error('Network or other error:' + error.message);
            res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed run view instance - viewManager seems to be down'});
        }
    }
}

module.exports = {
    associateAppWithStorageAppHolder,
    registerNewProfile,
    requestNewPermission,
    isAccessTokenForGivenPermissionRequestActive,
    uploadNewEvents,
    modifyEvent,
    deleteEvent,
    getAllEventsOfGivenProfile,
    registerNewViewInstanceAccess,
    runViewInstace
}