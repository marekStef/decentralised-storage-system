const path = require('path');
const fs = require('fs');

const getDirectoryForSourceCodes = () => path.join(process.cwd(), 'source_codes');

/**
 * Retrieves the directory path for a specified source code ID.
 *
 * This function constructs a path using the source code ID provided and checks if this directory exists in the file system.
 * If the directory does not exist, the function returns `null`.
 * 
 * @param {string} sourceCodeId - The ID of the source code for which the directory path is requested.
 * @returns {string|null} The full path to the directory containing the source code if it exists, or `null` if the directory does not exist.
 */
const getPathToGivenSourceCodeId = sourceCodeId => {
    const dir = path.join(getDirectoryForSourceCodes(), sourceCodeId);
    if (!fs.existsSync(dir)) {
        return null;
    }
    return dir;
}

module.exports = {
    getDirectoryForSourceCodes,
    getPathToGivenSourceCodeId
}