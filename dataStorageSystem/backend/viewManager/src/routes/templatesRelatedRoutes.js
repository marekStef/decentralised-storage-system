const express = require('express');
const router = express.Router();

const { createNewViewTemplate, deleteViewTemplate } = require('../controllers/templatesController');

const registerRoutes = (uploadMulterMiddleware) => {
    router.post('/createNewViewTemplate', uploadMulterMiddleware.array('files'), createNewViewTemplate);
    router.delete('/deleteViewTemplate/:templateId', deleteViewTemplate)

    return router;
}


module.exports = registerRoutes;