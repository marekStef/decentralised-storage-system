const mongoose = require('mongoose');

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

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

const is_given_app_holder_already_associated_with_real_app = appHolder => appHolder.dateOfAssociationByApp !== null;

const associate_app_with_storage_app_holder = async (req, res) => {
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

const register_new_profile = async (req, res) => {
    let {jwtTokenForPermissionRequestsAndProfiles, metadata, payload} = req.body;
    if (!jwtTokenForPermissionRequestsAndProfiles|| !metadata || !payload || payload.profile_name == undefined || payload.json_schema == undefined)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.MISSING_REQUIRED_FIELDS);

    let decodedToken;
    try {
        decodedToken = decodeJwtToken(jwtTokenForPermissionRequestsAndProfiles);
        console.log(decodedToken);
    } catch (error) {
        return res.status(401).json({message: 'Invalid or expired JWT token'});
    }

    const {nameDefinedByApp} = decodedToken;

    // checking profile uniquness - such profile cannot exist
    try {
        const {code, body} = await DataStorage.getProfileFromDataStorage(payload.profile_name)
        if (body.count != 0)
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.PROFILE_NAME_MUST_BE_UNIQUE);
    }
    catch ({code, message}) {
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    } 

    metadata = {
        ...metadata,
        acceptedDate: new Date().toISOString(),
        source: nameDefinedByApp,
        identifier: uuidv4()
    };

    try {
        const {code, body} = await DataStorage.getProfileFromDataStorage(metadata.profile)
        if (body.count != 1) {
            return generateBadResponse(res, httpStatusCodes.NOT_FOUND, applicationResponseMessages.error.PROFILE_DOES_NOT_EXIST);
        }
        const jsonSchema = body.data[0].payload.json_schema

        let isNewProfileEventValid = validateJsonSchema(jsonSchema, {metadata, payload});
        console.log("is it valid?" + isNewProfileEventValid)
        if (!isNewProfileEventValid) {
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.JSON_VALIDATION_ERROR);
        }
    }
    catch (err) {
        console.log(err)
        // {code, message}
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    } 

    // // check whether schema is a correct json at least
    // if (!isValidJSON(payload.json_schema)) {
    //     return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, applicationResponseMessages.error.SCHEMA_IS_INVALID_JSON);
    // }

    const newProfileEvent = {
        metadata,
        payload
    };

    try {
        const {code, message} = await DataStorage.sendEventsToDataStorage([newProfileEvent])
        if (code === 201) {
            console.log('Event uploaded successfully:', message);
        } else {
            // Other status codes except for 500
            console.error('Unexpected response status:', code);
            throw new Error('Unexpected response status: ' + code);
        }
    }
    catch (err) {
        if (err?.code == httpStatusCodes.CONFLICT)
            return generateBadResponse(res, httpStatusCodes.CONFLICT, generalResponseMessages.DUPLICATE_ERROR)
        console.log(err)
        console.error('Error registering new profile:', err);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    }

    res.status(httpStatusCodes.CREATED).json({
        message: applicationResponseMessages.success.NEW_PROFILE_REGISTERED,
        // profile: newProfile
    });
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
                read: permissionsRequest.read || false,
                create: permissionsRequest.create || false,
                modify: permissionsRequest.modify || false,
                delete: permissionsRequest.delete || false
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

    return res.status(httpStatusCodes.OK).json({
        isActive
    })
}

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event agains profile schema
const transformEvent = (profileNeededToBePresentInAllEvents, event, sourceAppName) => {
    // Validate event against Profile schema
    if (!event.metadata || !event.metadata.profile) {
        throw {
            statusCode: httpStatusCodes.BAD_REQUEST,
            message: 'Event does not contain correct metadata'
        }
    }

    if (!event.payload) {
        throw {
            statusCode: httpStatusCodes.BAD_REQUEST,
            message: 'Event does not contain payload'
        }
    }


    if (event.metadata.profile != profileNeededToBePresentInAllEvents) {
        throw{
            statusCode: httpStatusCodes.NOT_FOUND,
            message: 'One of the events has different profile set in metadata'
        }
    }

    // todo - repair checking profile - currently new events are not checked against it

    // const foundProfileData = await EventProfileSchema.findOne({ name: event.metadata.profile });

    // if (!foundProfileData) {
    //     throw Error(res.status(httpStatusCodes.NOT_FOUND).json({ message: applicationResponseMessages.error.PROFILE_NOT_FOUND }));
    // }

    // if (!validateJsonSchema(JSON.parse(foundProfileData.schema), event.payload)) {
    //     console.log("<<<<<<");
    //     console.log("why it is here first");
    //     throw Error(res.status(httpStatusCodes.BAD_REQUEST).json({ message: applicationResponseMessages.error.EVENT_PAYLOAD_DOES_NOT_MATCH_PROFILE_SCHEMA }));
    // }

    return {
        ...event,
        metadata: {
            ...event.metadata,
            source: sourceAppName,
            identifier: uuidv4()
        }
    };
}

// checks whether the event contains profile name passed by profileNeededToBePresentInAllEvents parameter
// validates the event agains profile schema
const transformEvents = (profileNeededToBePresentInAllEvents, events, sourceAppName) => {
    return events.map(event => transformEvent(profileNeededToBePresentInAllEvents, event, sourceAppName))
}

// sends events to dataStorage component
const sendEventsToDataStorage = async (res, events) => {
    try {
        const response = await axios.post(`${process.env.DATA_STORAGE_URL}/app/api/upload_new_events`, {
            events: events
        });

        if (response.status === 201) {
            console.log('Event uploaded successfully:', response.data);
            return res.status(201).json({ message: response.data.message, events: response.data.events });
        } else {
            // Other status codes except for 500
            console.error('Unexpected response status:', response.status);
            throw new Error('Unexpected response status: ' + response.status);
        }
    } catch (error) {
        console.error('Error uploading new event:', error);

        if (error.response && error.response.status === 500) {
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error at the data storage service.' });
        } else {
            // network issue
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error while sending events.' });
        }
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

    let sourceAppName = dataAccessPermission.app.nameDefinedByApp

    // add the events

    let updatedEvents;
    try {
        updatedEvents = transformEvents(profileCommonForAllEventsBeingUploaded, events, sourceAppName)
    }
    catch (errResponse) {
        console.log(errResponse)
        return res.status(errResponse.statusCode).json({ message: errResponse.message })
    }

    try {
        await sendEventsToDataStorage(res, updatedEvents)
    } catch (errResponse) {
        // console.log(errResponse);
        // console.log("<<<<<<1");
        return errResponse;
    }
};

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
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: 'Access permission is not active or has been revoked' });
    }

    const hasCreatePermission = dataAccessPermission.permission.read == true;
    if (!hasCreatePermission) {
        return res.status(httpStatusCodes.FORBIDDEN).json({ message: applicationResponseMessages.error.NO_READ_PERMISSION_FOR_EVENT });
    }

    // let sourceAppName = dataAccessPermission.app.nameDefinedByApp

    try {
        const response = await axios.post(`${process.env.DATA_STORAGE_URL}/app/api/get_filtered_events`, {
            metadataMustContain: {
                profile: dataAccessPermission.permission.profile
            }
        });

        if (response.status == httpStatusCodes.OK) {
            // console.log('Event received successflly:', response.data);
            return res.status(httpStatusCodes.OK).json({ events: response.data.data, count: response.data.count });
        } else {
            // Other status codes except for 500
            console.error('Unexpected response status:', response);
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Could not fetch eventss" });
        }
    } catch (error) {
        console.error('Error fetching events:', error);

        if (error.response && error.response.status === 500) {
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Could not fetch events2" });
        } else {
            // network issue
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Could not fetch events3" }); // todo - this is useless as of now
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

const generateTokenForViewAccess = (viewInstanceId, appId, authServiceViewAccessId) => {
    return generateJwtToken({
        viewInstanceId,
        appId,
        authServiceViewAccessId
    })
}

const decodeTokenForViewAccess = (token) => {
    return decodeJwtToken(token);
}

const registerNewViewInstance = async (req, res) => {
    const { viewTemplateId, jwtTokenForPermissionRequestsAndProfiles, configuration } = req.body;

    if (!viewTemplateId | !jwtTokenForPermissionRequestsAndProfiles || !configuration) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'viewTemplateId, jwtTokenForPermissionRequestsAndProfiles and configuration are required' });
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
        responseFromViewManager = await axios.post(`${process.env.VIEW_MANAGER_URL}/createNewViewInstance`, {
            viewTemplateId,
            jwtTokenForPermissionRequestsAndProfiles,
            configuration
        });

        if (responseFromViewManager.status != httpStatusCodes.CREATED) {
            // Other status codes except for 500
            console.error('Unexpected response status:', response);
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: response.data.message });
        }
    } catch (error) {
        console.error('Error creating new view instance:', error);
        if (error.response && error.response.data && error.response.data.message) {
            console.error('Error from js execution service:', error.response.data.message);
            res.status(error.response.status).send({message: error.response.data.message});
        } else {
            console.error('Network or other error:', error.message);
            res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed create new view instance'});
        }
    }

    viewInstanceId = responseFromViewManager.data._id;

    try {
        const viewAccess = new ViewAccessSchema({
            app: appId,
            viewInstanceId,
        });
    
        await viewAccess.save();
        return res.status(httpStatusCodes.CREATED).json({ viewInstanceToken: generateTokenForViewAccess(viewInstanceId, appId, viewAccess._id) });
    }
    catch (err) {
        console.log(err);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong during saving of new view instance in auth service. Instance was created in view manager though.' });
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
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'viewAccessToken and clientCustomData are required' });
    }

    let decodedToken;
    try {
        decodedToken = decodeTokenForViewAccess(viewAccessToken);
    } catch (error) {
        return generateBadResponse(res, httpStatusCodes.UNAUTHORIZED, applicationResponseMessages.error.INVALID_OR_EXPIRED_JWT_TOKEN);
    }
    
    const {viewInstanceId, appId, authServiceViewAccessId} = decodedToken;

    if (!checkWhetherAccessInstanceWithGivenIdExistsAndMatchesWithViewInstanceInViewManager(authServiceViewAccessId, viewInstanceId)) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({ message: 'Given view does not exist' });
    }

    let responseFromViewManager = null;
    try {
        responseFromViewManager = await axios.post(`${process.env.VIEW_MANAGER_URL}/runViewInstance`, {
            viewInstanceId,
            clientCustomData,
        });

        if (responseFromViewManager.status != httpStatusCodes.OK) {
            console.error('Unexpected response status:', response);
            return res.status(responseFromViewManager.status).json({ message: responseFromViewManager.data.message });
        }

        return res.status(httpStatusCodes.OK).json({ ...responseFromViewManager.data })
    } catch (error) {
        console.error('Error during running of view instance:', error);
        if (error.response && error.response.data && error.response.data.message) {
            console.error('Error from view manager:', error.response.data.message);
            res.status(error.response.status).send({message: error.response.data.message});
        } else {
            console.error('Network or other error:', error.message);
            res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed run view instance - viewManager seems to be down'});
        }
    }
}

module.exports = {
    associate_app_with_storage_app_holder,
    register_new_profile,
    request_new_permissions,
    isAccessTokenForGivenPermissionRequestActive,
    uploadNewEvents,
    getAllEventsOfGivenProfile,
    registerNewViewInstance,
    runViewInstace
}