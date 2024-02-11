const fs = require('fs');
const logger = require('../../logger/winston');

const deleteFiles = (callback = null, filesPaths) => {
    filesPaths.forEach(filePath => {
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.log({
                    level: 'error',
                    message: `Failed to delete file: ${err}`,
                });
                callback && callback(err, null);
            } else {
                logger.log({
                    level: 'info',
                    message: `Successfully deleted file ${filePath}`,
                });
                callback && callback(null, 'Successfully deleted');
            }
        });
    })
};

module.exports = {
    deleteFiles,
};