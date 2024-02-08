const httpStatusCodes = require('../../src/constants/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const applicationResponseMessages = require('../constants/forApiResponses/application/responseMessages');

const {generateBadResponse} = require('./helpers/generalHelpers');
const {generateJwtToken, decodeJwtToken} = require('./helpers/jwtGenerator');

const ApplicationSchema = require('../database/models/applicationRelatedModels/ApplicationSchema');
const OneTimeAssociationToken = require('../database/models/applicationRelatedModels/OneTimeAssociationTokenForApplication');
const EventProfileSchema = require('../database/models/eventRelatedModels/EventProfileSchema');

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
        const generatedJwtToken = generateJwtToken(appHolder._id, appHolder.nameDefinedByUser, nameDefinedByApp);

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
        generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
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

const upload_new_event = async (req, res) => {
    // TODO - Generated token needs to be checked here whether the app has access
}

module.exports = {
    register_new_profile,
    upload_new_event,
    associate_app_with_storage_app_holder
}