const { v4: uuidv4 } = require('uuid');

const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const applicationResponseMessages = require('../constants/forApiResponses/application/responseMessages');

const {generateBadResponse} = require('./helpers/generalHelpers');
const {generateJwtToken, decodeJwtToken} = require('./helpers/jwtGenerator');

const ApplicationSchema = require('../database/models/applicationRelatedModels/ApplicationSchema');
const OneTimeAssociationToken = require('../database/models/applicationRelatedModels/OneTimeAssociationTokenForApplication');
const EventProfileSchema = require('../database/models/eventRelatedModels/EventProfileSchema');
const EventSchema = require('../database/models/eventRelatedModels/EventSchema');
const DataAccessPermissionSchema = require('../database/models/dataAccessRelatedModels/DataAccessPermissionSchema');

const mongoDbCodes = require('../constants/mongoDbCodes');
const {validateJsonSchema, isValidJSON} = require('./helpers/jsonSchemaValidation');

const is_given_app_holder_already_associated_with_real_app = appHolder => appHolder.dateOfAssociationByApp !== null;

const associate_app_with_storage_app_holder = async (req, res) => {
    const {associationTokenId, nameDefinedByApp} = req.body;

    if (!associationTokenId || !nameDefinedByApp)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.ASSOCIATION_TOKEN_OR_NAME_MISSING);

    try {
        // Find the association token
        const token = await OneTimeAssociationToken.findById(associationTokenId).populate('app');

        if (!token) // check whether the token actually exists
            return generateBadResponse(res, httpStatusCodes.NOT_FOUND, applicationResponseMessages.error.INVALID_ASSOCIATION_TOKEN);

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
        const existingAppWithSameName = await ApplicationSchema.findOne({nameDefinedByApp});
        if (existingAppWithSameName && existingAppWithSameName._id.toString() !== appHolder._id.toString()) {
            return generateBadResponse(res, httpStatusCodes.CONFLICT, applicationResponseMessages.error.APP_NAME_CONFLICT);
        }

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
        if (error.code === mongoDbCodes.DUPLICATE_ERROR) {
            return generateBadResponse(res, httpStatusCodes.CONFLICT, applicationResponseMessages.error.APP_NAME_CONFLICT);
        }

        console.error('Error associating app with storage app holder:', error);
        generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

// return res.status(401).json({message: 'Invalid or expired JWT token'});

const register_new_profile = async (req, res) => {
    let {jwtTokenForPermissionRequestsAndProfiles, name, metadata, schema} = req.body;
    if (!jwtTokenForPermissionRequestsAndProfiles || !name || !metadata || !schema)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.MISSING_REQUIRED_FIELDS);

    let decodedToken;
    try {
        decodedToken = decodeJwtToken(jwtTokenForPermissionRequestsAndProfiles);
        console.log(decodedToken);
    } catch (error) {
        return res.status(401).json({message: 'Invalid or expired JWT token'});
    }

    const {nameDefinedByApp} = decodedToken;

    try {
        const existingProfile = await EventProfileSchema.findOne({name: name});
        if (existingProfile) {
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.PROFILE_NAME_MUST_BE_UNIQUE);
        }


        // preprocessing [start]
        metadata = {
            ...metadata,
            acceptedDate: new Date().toISOString(),
            sourceAppName: nameDefinedByApp
        };
        // preprocessing [end]

        // validate this new profile event agains the profile described in the metada // TODO - IS THIS HOW WE WANTED IT TO BE?
        if (metadata.profile == process.env.DEFAULT_CORE_PROFILE_SCHEMA_NAME) {
            const referencedProfile = await EventProfileSchema.findOne({name: metadata.profile});
            if (!referencedProfile) {
                return generateBadResponse(res, httpStatusCodes.NOT_FOUND, applicationResponseMessages.error.PROFILE_DOES_NOT_EXIST);
            }
            let isNewProfileEventValid = validateJsonSchema(JSON.parse(referencedProfile.schema), {name, metadata, schema});

            console.log("is it valid?" + isNewProfileEventValid)
            if (!isNewProfileEventValid) {
                return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.JSON_VALIDATION_ERROR);
            }
        } else {
            return generateBadResponse(res, httpStatusCodes.NOT_FOUND, applicationResponseMessages.error.PROFILE_DOES_NOT_EXIST);
        }

        // check whether schema is a correct json at least
        if (!isValidJSON(schema)) {
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.SCHEMA_IS_INVALID_JSON);
        }

        const newProfile = new EventProfileSchema({
            name,
            metadata,
            schema
        });
        await newProfile.save();

        res.status(httpStatusCodes.CREATED).json({
            message: applicationResponseMessages.success.NEW_PROFILE_REGISTERED,
            profile: newProfile
        });
    } catch (error) {
        console.error('Error registering new profile:', error);
        generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    }
};

const request_new_permissions = async (req, res) => {
    const { jwtTokenForPermissionRequestsAndProfiles, permissionsRequest } = req.body;

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
                read: permissionsRequest.readRight || false,
                create: permissionsRequest.createRight || false,
                modify: permissionsRequest.modifyRight || false,
                delete: permissionsRequest.deleteRight || false
            },
            createdDate: new Date(),
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


        res.status(httpStatusCodes.CREATED).json({
            message: applicationResponseMessages.success.PERMISSIONS_REQUESTED_SUCCESS,
            generatedAccessToken: newGeneratedAccessJwtToken
        });
    } catch (error) {
        console.error('Error requesting new permissions:', error);
        generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    }
};

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event agains profile schema
// saves the event into db
const addNewEvent = async (res, profileNeededToBePresentInAllEvents, event, sourceAppName) => {
    // Validate event against Profile schema
    if (!event.metadata || !event.metadata.profile)
        throw Error(res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'Event does not contain correct metadata' }));

    if (event.metadata.profile != profileNeededToBePresentInAllEvents)
        throw Error(res.status(httpStatusCodes.NOT_FOUND).json({ message: 'One of the events has different profile set in metadata' }));

    const foundProfileData = await EventProfileSchema.findOne({ name: event.metadata.profile });

    if (!foundProfileData) {
        throw Error(res.status(httpStatusCodes.NOT_FOUND).json({ message: applicationResponseMessages.error.PROFILE_NOT_FOUND }));
    }

    if (!validateJsonSchema(JSON.parse(foundProfileData.schema), event.payload)) {
        console.log("<<<<<<");
        console.log("why it is here first");
        throw Error(res.status(httpStatusCodes.BAD_REQUEST).json({ message: applicationResponseMessages.error.EVENT_PAYLOAD_DOES_NOT_MATCH_PROFILE_SCHEMA }));
    }

    const newEvent = new EventSchema({
        ...event,
        payload: JSON.stringify(event.payload),
        metadata: {
            ...event.metadata,
            source: sourceAppName,
            identifier: uuidv4()
        }
    });

    try {
        await newEvent.save();
    }
    catch (error) {
        // TODO - IDENTIFER IN METADATA CAN CASUE DUPLICATE KEY ERROR ( IT IS MARKED AS UNIQUE )
        console.error('Error uploading new event:', error);
        throw Error(res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: generalResponseMessages.INTERNAL_SERVER_ERROR }));
    }
}

const uploadNewEvents = async (req, res) => {
    const { accessToken, profileCommonForAllEventsBeingUploaded, events } = req.body;

    // if (!accessToken || !payload || !metadata || !metadata.profile) {
    if (!accessToken || !profileCommonForAllEventsBeingUploaded || !events) {
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

    // Validate DataAccessToken
    const dataAccessPermission = await DataAccessPermissionSchema.findById(dataAccessPermissionId).populate('app');
    // console.log("-------", dataAccessPermissionId)
    if (!dataAccessPermission || !dataAccessPermission.isActive) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: 'Access permission is not active or has been revoked' });
    }

    // Check for create permission
    const hasCreatePermission = dataAccessPermission.permission.profile == profileCommonForAllEventsBeingUploaded && dataAccessPermission.permission.create == true;

    if (!hasCreatePermission) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.NO_CREATE_PERMISSION_FOR_EVENT_CREATION });
    }

    // add the events
    try {
        await Promise.all(events.map(event => addNewEvent(res, profileCommonForAllEventsBeingUploaded, event, sourceAppName=dataAccessPermission.app.nameDefinedByApp)));
        res.status(httpStatusCodes.CREATED).json({ message: applicationResponseMessages.success.EVENTS_UPLOADED_SUCCESSFULLY });
    } catch (errResponse) {
        console.log(errResponse);
        console.log("<<<<<<1");
        return errResponse;
    }
};

module.exports = {
    associate_app_with_storage_app_holder,
    register_new_profile,
    request_new_permissions,
    uploadNewEvents
}