// const ivm = require('isolated-vm');
// const fs = require('fs').promises;
const path = require('path');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {getPathToGivenSourceCodeId} = require("./helpers/directory");

const sourceCodeSpecificConstants = require('../constants/sourceCodeSpecific');


// const runJsFileInIsolatedVm = async (filePath, args) => {
//     const isolate = new ivm.Isolate({ memoryLimit: 128 });
//     const context = await isolate.createContext();
//     const jail = context.global;

//     await jail.set('global', jail.derefInto());

//     // Transfer the arguments to the isolated VM
//     const argsTransferable = new ivm.ExternalCopy(args).copyInto({ release: true });
//     await jail.set('args', argsTransferable);

//     const fetchReference = new ivm.Reference(async (url, options) => {
//         try {
//             options = JSON.parse(options);
//             console.log(url, options);
//             console.log('---------');
//             const response = await fetch(url, options);
//             const text = await response.text(); // assuming json onlyn
//             console.log(text);
//             return new ivm.ExternalCopy(text).copyInto();
//         } catch (error) {
//             console.error('Fetch error:', error);
//             throw new ivm.Reference(error);
//         }
//     });
//     await jail.set('fetch', fetchReference);

//     const code = await fs.readFile(filePath, 'utf8');
//     try {
//         const script = await isolate.compileScript(code);
//         const result = await script.run(context);

//         console.log(`Successfully ran ${path.basename(filePath)}, with return value:`, result);
//         return result;
//     } catch (error) {
//         console.error(`Error running ${path.basename(filePath)}:`, error);
//         return null;
//     }
// }


const executeSourceCode = async (req, res) => {
    const { sourceCodeId } = req.params;
    const { parametersForMainEntry } = req.body;

    if (!sourceCodeId) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'No source code id specified' });
    }

    // Check if parametersForMainEntry is of type array
    if (!Array.isArray(parametersForMainEntry)) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'parametersForMainEntry must be of type array' });
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
            return res.status(400).send('Source code not available - it exists but some error happened while loading it');
        }
    }
    catch (err) {
        console.log(err.message);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'There is a syntax error. Code could not be loaded' });
    }

    try {
        console.log('Executing code with parameters:', req.body);
        const result = await dynamicModule(...parametersForMainEntry);
        res.status(httpStatusCodes.OK).json({message: 'Code execution result', result });
    }
    catch (err) {
        console.log(err.message);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: `Problem loading a module (${err.message})` });
    }
}

module.exports = {
    executeSourceCode
}