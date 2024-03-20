const express = require('express');
const router = express.Router();

const { createNewViewTemplate, deleteViewTemplate, getAllTemplates, getTemplate } = require('../controllers/templatesController');

const registerRoutes = (uploadMulterMiddleware) => {
    router.post('/createNewViewTemplate', uploadMulterMiddleware.array('files'), createNewViewTemplate);

    router.delete('/deleteViewTemplate/:templateId', deleteViewTemplate);

    router.get('/templates', getAllTemplates);

    router.get('/templates/:templateId', getTemplate);

    return router;
}


module.exports = registerRoutes;