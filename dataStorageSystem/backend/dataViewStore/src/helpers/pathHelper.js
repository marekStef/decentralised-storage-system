const fs = require('fs');
const path = require('path');
const {getDataViewDirectoryPath} = require("../configuration/configuration");

const getPathToDataViewTransformerFunctionsDirectoryOfGivenApp = async (appId, viewId, createIfNotPresent) => {
    const dir = path.join(getDataViewDirectoryPath(), appId, viewId);
    if (!fs.existsSync(dir)) {
        if (createIfNotPresent)
            await fs.promises.mkdir(dir, {recursive: true});
        else return null;
    }
    return dir;
}

module.exports = {
    getPathToDataViewTransformerFunctionsDirectoryOfGivenApp
};