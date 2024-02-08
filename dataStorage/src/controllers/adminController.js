const httpStatusCodes = require('../../src/constants/httpStatusCodes');
const responseMessages = require('../constants/forApiResponses/responseMessages');
const mongoDbCodes = require('../constants/mongoDbCodes');

const ApplicationSchema = require('../database/models/ApplicationSchema')

const generateBadResponse = (res, code, message) => {
    return res.status(code).json({ message });
}

const createNewApp = async (req, res) => {
    const { nameDefinedByUser } = req.body;

    if (!nameDefinedByUser) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, responseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_REQUIRED)
    }

    try {
        const newApplication = new ApplicationSchema({ nameDefinedByUser });
        
        const savedApplication = await newApplication.save();

        console.log("success")
        
        res.status(httpStatusCodes.CREATED).json({
            message: responseMessages.success.APPLICATION_REGISTERED,
            application: savedApplication
        });
    } catch (error) {
        if (error.code === mongoDbCodes.DUPLICATE_ERROR) {
            return generateBadResponse(res, httpStatusCodes.CONFLICT, responseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_ALREADY_EXISTING);
        }

        console.log(error)

        // other possible errors
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, responseMessages.error.APPLICATION_REGISTRATION_FAILED);
    }
}

module.exports = { createNewApp };