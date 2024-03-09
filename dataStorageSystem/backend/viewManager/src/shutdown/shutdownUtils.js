const logger = require('../logger/winston');
const {stopJavascriptExecutionService} = require('../servicesUtils/jsExecutionServiceUtil');

const gracefulShutdown = () => {
    logger.log({
        level: 'info',
        message: 'DataStorage Server about to be stopped',
    });
    stopJavascriptExecutionService();
    process.exit();
};

module.exports = {
    gracefulShutdown,
};