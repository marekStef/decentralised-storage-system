require('dotenv').config();

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const {v4: uuidv4} = require("uuid");
const cors = require('cors'); 
const path = require('path');

const registerCodeRegistrationRoutes = require('./src/routes/codeRegistrationRoutes');
const registerCodeExecutionRoutes = require('./src/routes/codeExecutionRoutes');

const app = express();

// Exit if PROJECT_ROOT environment variable is not set - we cannot continue
if (!process.env.PROJECT_ROOT || !process.env.SOURCE_CODES_DIRECTORY) {
    console.error("Error: PROJECT_ROOT or SOURCE_CODES_DIRECTORY environment variable is not set.");
    process.exit(1);
}

const UPLOADS_TEMPORARY_DIRECTORY = path.join(process.env.PROJECT_ROOT, process.env.UPLOADS_TEMPORARY_DIRECTORY);
const MAXIMUM_UPLOAD_LIMIT_PER_FILE = 1024 * 1024 * 5; // 5 MB
const MAXIMUM_NUMBER_OF_UPLOADED_FILES_PER_REQUEST = 10;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(UPLOADS_TEMPORARY_DIRECTORY)) {
            fs.mkdirSync(UPLOADS_TEMPORARY_DIRECTORY, { recursive: true });
        }
        cb(null, UPLOADS_TEMPORARY_DIRECTORY)
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '-' + Date.now() + '-' + file.originalname)
    }
});

const uploadMulterMiddleware = multer({ 
    storage: storage,
    fileSize: MAXIMUM_UPLOAD_LIMIT_PER_FILE,
    files: MAXIMUM_NUMBER_OF_UPLOADED_FILES_PER_REQUEST
});

app.use(cors()); // CORS enabled for all origins

app.use(express.json());

app.use('/', registerCodeRegistrationRoutes(uploadMulterMiddleware));
app.use('/', registerCodeExecutionRoutes());

const JS_EXECUTION_SERVICE_URL_MESSAGE = 'JS_EXECUTION_SERVICE_URL_MESSAGE';

app.listen(process.env.JAVASCRIPT_EXECUTION_SERVICE_PORT, () => {
    console.log(`JavascriptExecutionService listening at http://localhost:${process.env.JAVASCRIPT_EXECUTION_SERVICE_PORT}`);
    if (process && process.send) {
        process.send({type: JS_EXECUTION_SERVICE_URL_MESSAGE, url: `http://localhost:${process.env.JAVASCRIPT_EXECUTION_SERVICE_PORT}`});
    }
});