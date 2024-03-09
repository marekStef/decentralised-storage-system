const path = require('path');

const getDirectoryForSourceCodes = () => path.join(process.cwd(), 'source_codes');

module.exports = {
    getDirectoryForSourceCodes
}