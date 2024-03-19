const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');

const returnAuthServicePresence = async (req, res) => {
    res.status(httpStatusCodes.OK).json({
        status: "OK",
        dataStorageId: process.env.DATA_STORAGE_UNIQUE_ID
    });
}

module.exports = {
    returnAuthServicePresence
}