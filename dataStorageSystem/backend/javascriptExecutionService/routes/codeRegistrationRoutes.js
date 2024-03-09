const express = require('express');
const router = express.Router();

const { uploadNewSourceCode } = require('../controllers/codeRegistrationController');


const registerRoutes = (uploadMulterMiddleware) => {
    router.post('/uploadNewSourceCode', uploadMulterMiddleware.array('files'), uploadNewSourceCode);

    return router;
}


module.exports = registerRoutes;