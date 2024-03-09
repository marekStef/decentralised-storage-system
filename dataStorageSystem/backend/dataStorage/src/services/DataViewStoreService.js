// require('dotenv').config();

// /**
//  * Creates a new DataView transformer in the DataViewStore server.
//  *
//  * @param {string} appId - The ID of the application for which the DataView is being created.
//  * @param {string} newDataViewId - The ID for the new DataView.
//  * @param {Array<Object>} uploadedJavascriptFiles - An array of uploaded JavaScript files. Each object must contain properties `path` and `originalname`.
//  * @param {string} mainJavascriptEntry - The main entry point JavaScript file.
//  * @param {Object} mainEntryFunctionParameters - Parameters to be passed to the main entry function.
//  *
//  * @throws {DataViewStoreServerNotRunningError} Throws an error if the DataViewStore server is not running.
//  *
//  * @returns {Promise<string>} Returns a Promise that resolves to the URL of the created DataViewTransformer.
//  */
// const createNewDataViewTransformerInDataViewStore = async (appId, newDataViewId, uploadedJavascriptFiles, mainJavascriptEntry, mainEntryFunctionParameters) => {
//     const fileData = uploadedJavascriptFiles.map(file => ({
//         originalName: file.originalname,
//         data: fs.readFileSync(file.path, 'utf8')
//     }));

//     if (dataViewStoreUrl === null) throw new DataViewStoreServerNotRunningError();
    
//     const response = await axios.post(
//         `${dataViewStoreUrl}/createNewDataView`, 
//         {
//             appId,
//             viewId: newDataViewId,
//             javascriptFiles: fileData,
//             mainJavascriptEntry,
//             mainEntryFunctionParameters
//         }
//     );
//     return response.data.url;
// }

// module.exports = {
//     createNewDataViewTransformerInDataViewStore
// };