const express = require('express');
const router = express.Router();

const { createNewViewInstance } = require('../controllers/viewInstancesController');

const registerRoutes = () => {
    router.post('/createNewViewInstance', createNewViewInstance);

    return router;
}


module.exports = registerRoutes;