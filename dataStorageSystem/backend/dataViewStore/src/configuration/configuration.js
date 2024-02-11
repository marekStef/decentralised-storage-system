const path = require("path");

let dataViewStoreServerAddress = null;

const getDataViewStoreServerAddress = () => dataViewStoreServerAddress;
const setDataViewStoreServerAddress = newAddress => dataViewStoreServerAddress = newAddress;

const getDataViewTransformerFunctionsDirectoryPath = () => path.join(__dirname, '..', '..', 'dataViewTransformerFunctions');

module.exports = {
    getDataViewStoreServerAddress,
    setDataViewStoreServerAddress,
    getDataViewDirectoryPath: getDataViewTransformerFunctionsDirectoryPath
}