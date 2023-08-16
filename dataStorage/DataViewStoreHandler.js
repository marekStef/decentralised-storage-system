const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');

class DataViewStoreHandler {
    /**
     * Starts DataViewStore server and restarts it whenever it crashes
     */
    Start() {
        const serverB = spawn('node', ['..\\dataViewStore\\index.js']);

        serverB.stdout.on('data', (data) => {
            console.log(`[DataViewStore Server]: ${data}`);
        });
    
        serverB.stderr.on('data', (data) => {
            console.error(`[DataViewStore Server Error]: ${data}`);
        });
    
        serverB.on('exit', (code) => {
            console.error(`[DataViewStore Server] exited with code ${code}. Restarting...`);
            this.Start();
        });
    }

    async CreateNewDataViewTransformer(appId, newDataViewId, uploadedJavascriptFiles, mainJavascriptEntry, mainEntryFunctionParameters) {
        const fileData = uploadedJavascriptFiles.map(file => {
            return {
                originalName: file.originalname,
                data: fs.readFileSync(file.path, 'utf8')
            };
        });
        
        const response = await axios.post(
            'http://localhost:3001/createNewDataView', 
            {
                appId,
                viewId: newDataViewId,
                javascriptFiles: fileData,
                mainJavascriptEntry,
                mainEntryFunctionParameters
            }
        );
        return response.data.url;
    }
}

module.exports = DataViewStoreHandler;