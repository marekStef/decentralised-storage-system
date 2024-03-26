const express = require('express');
const router = express.Router();

const { createNewViewInstance, runViewInstance, getViewInstanceDetails } = require('../controllers/viewInstancesController');

const registerRoutes = () => {
    router.post('/createNewViewInstance', createNewViewInstance);

    router.post('/runViewInstance', runViewInstance);
    
    router.get('/:viewInstanceId', getViewInstanceDetails);

    return router;
}


module.exports = registerRoutes;