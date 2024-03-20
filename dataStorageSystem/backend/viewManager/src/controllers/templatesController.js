require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {ViewTemplate} = require('../database/models/ViewTemplateSchema');
const ViewInstance = require('../database/models/ViewInstanceSchema');
const {isAllowedRuntime} = require('../constants/viewsRelated');

const cleanFiles = files => {
    files.forEach(file => {
        fs.unlinkSync(file.path);
    });
}

// this is a multipart data request (due to those files being uploaded) - so the things in the body are only texts! They need to be parsed individually
const createNewViewTemplate = async (req, res) => {
    const files = req.files;
    let { profiles, runtime, templateName } = req.body;

    console.log(profiles);

    try {
        profiles = JSON.parse(profiles)
    }
    catch (e) {
        console.log(e);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'Profiles is not a correct json array' });
    }

    if (!profiles || !runtime || !templateName) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'profiles, runtime and templateName must be present' });
    }

    if (!isAllowedRuntime(runtime)) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            message: `${runtime} is not an allowed runtime`,
            allowedRuntimes
        })
    }

    const existingTemplate = await ViewTemplate.findOne({ templateName: templateName });
    if (existingTemplate) {
        return res.status(httpStatusCodes.CONFLICT).json({ message: 'Template name must be unique' });
    }

    const formData = new FormData();

    files.forEach(file => {
        formData.append('files', fs.createReadStream(file.path), file.originalname);
    });

    try {
        const response = await axios.post(`${process.env.JAVASCRIPT_EXECUTION_SERVICE_URI}/uploadNewSourceCode`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        cleanFiles(files);

        if (response.status === httpStatusCodes.CREATED) {
            const sourceCodeId = response.data.sourceCodeId;

            const newViewTemplate = new ViewTemplate({
                sourceCodeId: sourceCodeId,
                metadata: { runtime: 'javascript' },
                profiles: profiles,
                templateName
            });

            await newViewTemplate.save(); // Save the new record to the database

            res.status(httpStatusCodes.CREATED).send({sourceCodeId: sourceCodeId, viewTemplateId: newViewTemplate._id });
        } else {
            // If something went wrong, forward the response message
            res.status(response.status).send({message: response.data.message});
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.error('Error from js execution service:', error.response.data.message);
            res.status(error.response.status).send({message: error.response.data.message});
        } else {
            console.error('Network or other error:', error.message);
            res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to register source code.'});
        }
    }
}

const deleteViewTemplate = (req, res) => {
    const {templateId} = req.params;

    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'not implemented yet', id: templateId });
}

const getAllTemplates = async (req, res) => {
    try {
        const viewTemplates = await ViewTemplate.find({});

        res.status(httpStatusCodes.OK).json({viewTemplates});
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};

const getTemplate = async (req, res) => {
    const { templateId } = req.params;
    if (!templateId) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'templateId must be present' });
    }

    try {
        const template = await ViewTemplate.findById(templateId);
        if (!template) {
            return res.status(httpStatusCodes.NOT_FOUND).json({ message: 'Template not found' });
        }

        const executionServerEndpoint = `${process.env.JAVASCRIPT_EXECUTION_SERVICE_URI}/sourceCodes/${template.sourceCodeId}`;
        const response = await axios.get(executionServerEndpoint);
        const sourceCode = response.data.sourceCode;

        const viewInstances = await ViewInstance.find({ viewTemplate: template._id });
        const isInUse = viewInstances.length > 0;

        return res.status(httpStatusCodes.OK).json({ 
            template, 
            sourceCode,
            viewInstances,
            isInUse
         });
    } catch (error) {
        console.error('Error fetching template or source code:', error);
        if (error.response && error.response.status) {
            return res.status(error.response.status).json({ message: error.message });
        } else {
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
        }
    }
};

module.exports = {
    createNewViewTemplate,
    deleteViewTemplate,
    getAllTemplates,
    getTemplate
}