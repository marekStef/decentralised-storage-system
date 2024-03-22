const express = require('express');
const router = express.Router();

const { createNewViewInstance, runViewInstance, getViewInstanceDetails } = require('../controllers/viewInstancesController');

const registerRoutes = () => {
    router.post('/viewInstances/createNewViewInstance', createNewViewInstance);

    router.post('/viewInstances/runViewInstance', runViewInstance);
    
    router.get('/viewInstances/:viewInstanceId', getViewInstanceDetails);

    return router;
}


module.exports = registerRoutes;