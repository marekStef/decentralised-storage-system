const fs = require('fs');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const httpStatusCodes = require('../constants/httpStatusCodes');

const {getDirectoryForSourceCodes} = require('./helpers/directory');

const sourceCodeSpecificConstants = require('../constants/sourceCodeSpecific');

const isOneFileNamedMain = (files) => {
    const filteredFiles = files.filter(file =>
        file.originalname === sourceCodeSpecificConstants.SOURCE_CODE_MAIN_ENTRY_FILE_NAME
    );

    return filteredFiles.length === 1;
}

const uploadNewSourceCode = (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'No files were uploaded.'});
    }

    const allJavascriptFiles = files.every(file =>
        path.extname(file.originalname).toLowerCase() === '.js'
    );

    // One file must be named `main.js`
    if (!isOneFileNamedMain(files)) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: `Exactly one file must be named ${sourceCodeSpecificConstants.SOURCE_CODE_MAIN_ENTRY_FILE_NAME}`})
    }

    if (!allJavascriptFiles) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'All files must be JavaScript files.'});
    }

    const uniqueDirName = uuidv4();
    const targetDir = path.join(getDirectoryForSourceCodes(), uniqueDirName);
    console.log(targetDir);

    try {
        fs.mkdirSync(targetDir, {recursive: true});

        for (const file of files) {
            const sourcePath = file.path;
            const targetPath = path.join(targetDir, file.originalname);
            fs.copyFileSync(sourcePath, targetPath);
            fs.unlinkSync(sourcePath);
        }

        // Return the unique directory name as the folder id
        return res.status(httpStatusCodes.CREATED).json({ message: 'Files were uploaded', filesId: uniqueDirName});
    } catch (error) {
        console.error('Failed to process files:', error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong during the uploading' });
    }
}

module.exports = {
    uploadNewSourceCode
}