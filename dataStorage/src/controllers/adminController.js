const httpStatusCodes = require('../../src/constants/httpStatusCodes');
const adminResponseMessages = require('../constants/forApiResponses/admin/responseMessages');
const generalResponseMessages = require('../constants/forApiResponses/general');
const mongoDbCodes = require('../constants/mongoDbCodes');
const {generateBadResponse} = require('./helpers/helpers');

const ApplicationSchema = require('../database/models/applicationRelatedModels/ApplicationSchema')
const OneTimeAssociationToken = require('../database/models/applicationRelatedModels/OneTimeAssociationTokenForApplication');

const createNewAppConnection = async (req, res) => {
    const { nameDefinedByUser } = req.body;

    if (!nameDefinedByUser) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_REQUIRED)
    }

    try {
        const newApplication = new ApplicationSchema({ nameDefinedByUser });
        
        const savedApplication = await newApplication.save();

        res.status(httpStatusCodes.CREATED).json({
            message: adminResponseMessages.success.APPLICATION_REGISTERED,
            appHolderId: savedApplication._id
        });
    } catch (error) {
        if (error.code === mongoDbCodes.DUPLICATE_ERROR) {
            return generateBadResponse(res, httpStatusCodes.CONFLICT, adminResponseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_ALREADY_EXISTING);
        }

        console.log(error)

        // other possible errors
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, adminResponseMessages.error.APPLICATION_REGISTRATION_FAILED);
    }
}

// returns bool whether the app holder created by user has been already associated with the real software application
const isAppAlreadyAssociated = app => {
    return app.dateOfAssociationByApp !== null
}

// function for generating one-time association token 
// which the real software app will use to associate itself with its app holder in storage system

const generateOneTimeTokenForAssociatingRealAppWithAppConnection = async (req, res) => {
    const { appHolderId } = req.body; // assuming the app's ID is passed as 'appHolderId'

    if (!appHolderId) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.error.APP_ID_NOT_PROVIDED);
    }

    try {
        const app = await ApplicationSchema.findById(appHolderId);

        if (!app)
            return generateBadResponse(res, httpStatusCodes.NOT_FOUND, adminResponseMessages.error.APPLICATION_NOT_FOUND);

        if (isAppAlreadyAssociated(app))
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.APPLICATION_HOLDER_ALREADY_ASSOCIATED_WITH_PHYSICAL_APP);

        const existingToken = await OneTimeAssociationToken.findOne({ app: appHolderId });
        // there should not be existing token - only one token for association can be generated
        if (existingToken)
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.ASSOCIATION_TOKEN_ALREADY_CREATED);

        // All checks passed, generate new token
        const newToken = new OneTimeAssociationToken({ app: appHolderId });
        await newToken.save();

        res.status(httpStatusCodes.CREATED).json({
            message: adminResponseMessages.success.ONE_TIME_ASSOCIATION_TOKEN_CREATED,
            tokenId: newToken._id
        });

    } catch (error) {
        console.error(adminResponseMessages.error.ASSOCIATION_TOKEN_GENERATING_FAILED + ": " + error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: generalResponseMessages.INTERNAL_SERVER_ERROR });
    }
};

module.exports = { 
    createNewAppConnection,
    generateOneTimeTokenForAssociatingRealAppWithAppConnection
};