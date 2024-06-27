const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');


/**
 * Handles the request to check the presence of data storage.
 * Responds with the status and a unique identifier for the data storage.
 *
 * @param {Object} req - The request object from the client.
 * @param {Object} res - The response object to send the response.
 */
const returnDataStoragePresence = async (req, res) => {
    res.status(httpStatusCodes.OK).json({
        status: "OK",
        dataStorageId: process.env.DATA_STORAGE_UNIQUE_ID
    });
}

module.exports = {
    returnDataStoragePresence
}