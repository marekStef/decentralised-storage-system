// const fs = require('fs').promises;
const path = require('path');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {getPathToGivenSourceCodeId} = require("./helpers/directory");

const sourceCodeSpecificConstants = require('../constants/sourceCodeSpecific');

const executeSourceCode = async (req, res) => {
    const { sourceCodeId } = req.params;
    const { parametersForMainEntry } = req.body;

    if (!sourceCodeId) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'No source code id specified' });
    }

    // Check if parametersForMainEntry is of type object
    if (typeof parametersForMainEntry !== 'object' || parametersForMainEntry === null) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'parametersForMainEntry must be of type object' });
    }

    const pathToSourceCode = getPathToGivenSourceCodeId(sourceCodeId);
    if (pathToSourceCode == null) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'Given source code does not exist' });
    }

    const mainEntryModulePath = path.join(pathToSourceCode, sourceCodeSpecificConstants.SOURCE_CODE_MAIN_ENTRY_FILE_NAME);

    // const result = await runJsFileInIsolatedVm(mainEntryModulePath, parametersForMainEntry);
    // res.status(httpStatusCodes.OK).json({message: 'Code execution result', result });

    let dynamicModule;
    try {
        dynamicModule = require(mainEntryModulePath);
        if (!dynamicModule) {
            return res.status(httpStatusCodes.BAD_REQUEST).send('Source code not available - it exists but some error happened while loading it');
        }
    }
    catch (err) {
        console.log(err.message);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'There is a syntax error. Code could not be loaded' });
    }

    try {
        console.log('Executing code with parameters:', req.body);
        console.log('here');
        const result = await dynamicModule(parametersForMainEntry);
        res.status(httpStatusCodes.OK).json({message: 'Code execution result', result });
    }
    catch (err) {
        console.log(err);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: `Problem loading a module (${err})` });
    }
}

module.exports = {
    executeSourceCode
}