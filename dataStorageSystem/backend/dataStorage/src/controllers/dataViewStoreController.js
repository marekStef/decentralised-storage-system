// const {v4: uuidv4} = require("uuid");
// const {createNewDataViewTransformerInDataViewStore} = require("../services/DataViewStoreService");
// const { deleteFiles } = require('../utils/filesRelated/fileHandler');
// const {DataViewStoreServerNotRunningError} = require("../utils/customErrors/dataViewStoreErrors");
// const logger = require('../logger/winston');

// const createNewDataView = async (req, res) => {
//     const uploadedJavascriptFiles = req.files;
//     const mainJavascriptEntry = req.body.mainEntry; // this file needs to export by default one function which will be called

//     // this is an array of types of parameters - TODO - not sure about this
//     const mainEntryFunctionParameters = req.body.mainEntryParameters;

//     // id of the app which wants to create this new view on data - I'll get this from token in the future
//     const appId = "alsdkfjaoqji1231234adsfklaf";
//     const newDataViewId = uuidv4();

//     if (!uploadedJavascriptFiles || !mainJavascriptEntry || !mainEntryFunctionParameters || !Array.isArray(mainEntryFunctionParameters)) {
//         return res.sendStatus(400);
//     }

//     try {
//         const responseUrl = await createNewDataViewTransformerInDataViewStore(
//             appId,
//             newDataViewId,
//             uploadedJavascriptFiles,
//             mainJavascriptEntry,
//             mainEntryFunctionParameters,
//         );

//         // delete all uploaded files
//         deleteFiles(null, uploadedJavascriptFiles.map(f => f.path));

//         res.send({
//             url: responseUrl
//         });
//     } catch (error) {
//         if (error instanceof DataViewStoreServerNotRunningError) {
//             logger.log({
//                 level: 'error',
//                 message: `DataViewStoreServer is not running: ${error}`,
//                 route: '/create_new_data_view'
//             });
//             return res.status(500).send({ error: 'DataViewStoreServer is not running' });
//         }

//         console.error(error);
//         return res.sendStatus(500);
//     }
// };

// module.exports = {
//     createNewDataView
// };