const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');

/**
 * Return the presence of this auth service.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const returnAuthServicePresence = async (req, res) => {
    res.status(httpStatusCodes.OK).json({
        status: "OK",
        dataStorageId: process.env.DATA_STORAGE_UNIQUE_ID
    });
}

module.exports = {
    returnAuthServicePresence
}