const httpStatusCodes = require('../../src/constants/httpStatusCodes');
const generalResponseMessages = require('../constants/forApiResponses/general');
const applicationResponseMessages = require('../constants/forApiResponses/application/responseMessages');

const {generateBadResponse} = require('./helpers/helpers');

const ApplicationSchema = require('../database/models/applicationRelatedModels/ApplicationSchema');
const OneTimeAssociationToken = require('../database/models/applicationRelatedModels/OneTimeAssociationTokenForApplication');
const mongoDbCodes = require('../constants/mongoDbCodes');

const is_given_app_holder_already_associated_with_real_app = appHolder => appHolder.dateOfAssociationByApp !== null;

const associate_app_with_storage_app_holder = async (req, res) => {
    const { associationTokenId, nameDefinedByApp } = req.body;

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
        const existingAppWithSameName = await ApplicationSchema.findOne({ nameDefinedByApp });
        if (existingAppWithSameName && existingAppWithSameName._id.toString() !== appHolder._id.toString()) {
            return generateBadResponse(res, httpStatusCodes.CONFLICT, applicationResponseMessages.error.APP_NAME_CONFLICT);
        }

        // Update the app with the provided name and the association date
        appHolder.nameDefinedByApp = nameDefinedByApp;
        appHolder.dateOfAssociationByApp = new Date();
        await appHolder.save(); // possible conflic excpetion here - (DUPLICATE_ERROR) due to nameDefinedByApp

        // Delete the used association token
        await OneTimeAssociationToken.findByIdAndDelete(associationTokenId);

        res.status(httpStatusCodes.OK).json({
            message: applicationResponseMessages.success.APP_ASSOCIATED_WITH_STORAGE_APP_HOLDER,
            app: appHolder // remove when deployed
        });

    } catch (error) {
        if (error.code === mongoDbCodes.DUPLICATE_ERROR) {
            return generateBadResponse(res, httpStatusCodes.CONFLICT, applicationResponseMessages.error.APP_NAME_CONFLICT);
        }

        console.error('Error associating app with storage app holder:', error);
        generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR)
    }
};

const register_new_profile = async (req, res) => {
    // TODO
}

const upload_new_event = async (req, res) => {
    // TODO - Generated token needs to be checked here whether the app has access
}

module.exports = {
    register_new_profile,
    upload_new_event,
    associate_app_with_storage_app_holder
}