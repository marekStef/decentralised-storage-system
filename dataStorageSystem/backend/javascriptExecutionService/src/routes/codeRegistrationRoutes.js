const express = require('express');
const router = express.Router();

const { uploadNewSourceCode, getSourceCode, deleteSourceCode } = require('../controllers/codeRegistrationController');

const registerRoutes = (uploadMulterMiddleware) => {
    router.post('/uploadNewSourceCode', uploadMulterMiddleware.array('files'), uploadNewSourceCode);

    router.get('/sourceCodes/:sourceCodeId', getSourceCode);

    router.delete('/sourceCodes/:sourceCodeId', deleteSourceCode);

    return router;
}


module.exports = registerRoutes;