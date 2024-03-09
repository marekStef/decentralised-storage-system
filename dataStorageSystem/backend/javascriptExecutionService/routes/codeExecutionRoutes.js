const express = require('express');
const router = express.Router();

const { executeSourceCode } = require('../controllers/codeExecutionController');


const registerRoutes = () => {
    router.post('/executeSourceCode', executeSourceCode);

    return router;
}


module.exports = registerRoutes;