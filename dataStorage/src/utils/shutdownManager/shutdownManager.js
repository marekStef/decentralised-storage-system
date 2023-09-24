const pm2 = require('pm2');
const logger = require('../../logger/winston');
const {stopDataViewStore} = require("../../services/DataViewStoreService");

const gracefulShutdown = () => {
    logger.log({
        level: 'info',
        message: 'DataStorage Server about to be stopped',
    });
    stopDataViewStore();
    // Add any other cleanup logic here
    process.exit();
};

module.exports = {
    gracefulShutdown,
};