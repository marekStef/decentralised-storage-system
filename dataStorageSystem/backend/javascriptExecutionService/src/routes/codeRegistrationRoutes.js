const express = require('express');
const router = express.Router();

const { uploadNewSourceCode, getSourceCode } = require('../controllers/codeRegistrationController');


const registerRoutes = (uploadMulterMiddleware) => {
    router.post('/uploadNewSourceCode', uploadMulterMiddleware.array('files'), uploadNewSourceCode);

    router.get('/sourceCodes/:sourceCodeId', getSourceCode)

    return router;
}


module.exports = registerRoutes;