const express = require('express');
const router = express.Router();

const { createNewViewInstance, runViewInstance } = require('../controllers/viewInstancesController');

const registerRoutes = () => {
    router.post('/createNewViewInstance', createNewViewInstance);
    router.post('/runViewInstance', runViewInstance);

    return router;
}


module.exports = registerRoutes;