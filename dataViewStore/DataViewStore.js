//#region Imports

const fs = require('fs');
const path = require('path');

//#endregion

//#region constants

const {PATH_TO_SAVED_DATA_VIEW_TRANSFORMER_FUNCTIONS} = require('./constants/DataViewTransformersRelated');

//#endregion

class DataViewStore {
    /**
     * Loads all saved data view modules
     */
    start() {
        requireAllModules(PATH_TO_SAVED_DATA_VIEW_TRANSFORMER_FUNCTIONS);
    }
}

//#region Helpers

const requireAllModules = (dir) => {

    getAllAppIdsRegistered().forEach(appId => {
        const dataViews = fs.readdirSync(path.join(dir, appId));

        dataViews.forEach(viewId => {
            // Explanation for the next line of code:
            // Each data view is one directory with the name of the viewId. This is stored in the app id's directory.
            // Then each data view directory holds all javascript files uploaded during the creation of this data view.
            // The main entry file javascript (with one export function) is called [viewId].js
            const fullPathToMainEntry = path.join(dir, appId, viewId, `${viewId}.js`);
            require(fullPathToMainEntry);
        });
    });
};

const getAllAppIdsRegistered = () => fs.readdirSync(PATH_TO_SAVED_DATA_VIEW_TRANSFORMER_FUNCTIONS);

//#endregion


module.exports = DataViewStore;