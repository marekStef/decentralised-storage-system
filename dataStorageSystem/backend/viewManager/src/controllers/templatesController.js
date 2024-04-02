require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const mongoose = require('mongoose');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {ViewTemplate} = require('../database/models/ViewTemplateSchema');
const ViewInstance = require('../database/models/ViewInstanceSchema');
const {isAllowedRuntime} = require('../constants/viewsRelated');
const {allowedRuntimes} = require('../constants/viewsRelated');

const cleanFiles = files => {
    files.forEach(file => {
        fs.unlinkSync(file.path);
    });
}

// this is a multipart data request (due to those files being uploaded) - so the things in the body are only texts! They need to be parsed individually
const createNewViewTemplate = async (req, res) => {
    const files = req.files;
    let {profiles, runtime, templateName} = req.body;

    console.log(profiles);

    try {
        profiles = JSON.parse(profiles)
    }
    catch (e) {
        console.log(e);
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'Profiles is not a correct json array'});
    }

    if (!profiles || !runtime || !templateName) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'profiles, runtime and templateName must be present'});
    }

    if (!isAllowedRuntime(runtime)) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            message: `${runtime} is not an allowed runtime`,
            allowedRuntimes
        })
    }

    const existingTemplate = await ViewTemplate.findOne({templateName: templateName});
    if (existingTemplate) {
        return res.status(httpStatusCodes.CONFLICT).json({message: 'Template name must be unique'});
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
                metadata: {runtime: 'javascript'},
                profiles: profiles,
                templateName
            });

            await newViewTemplate.save(); // Save the new record to the database

            res.status(httpStatusCodes.CREATED).send({sourceCodeId: sourceCodeId, viewTemplateId: newViewTemplate._id, message: 'View Template was created'});
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
            res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Failed to register source code.'});
        }
    }
}

const getAllTemplates = async (req, res) => {
    try {
        const viewTemplates = await ViewTemplate.find({}).sort({createdDate: -1}); //sort in descending order

        res.status(httpStatusCodes.OK).json({viewTemplates});
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};

const getDetailedTemplateInformation = templateId => {
    return new Promise(async (res, rej) => {
        try {
            const template = await ViewTemplate.findById(templateId);
            if (!template) {
                return rej({
                    code: httpStatusCodes.NOT_FOUND,
                    message: 'Template not found'
                })
            }

            const executionServerEndpoint = `${process.env.JAVASCRIPT_EXECUTION_SERVICE_URI}/sourceCodes/${template.sourceCodeId}`;
            const response = await axios.get(executionServerEndpoint);
            const sourceCode = response.data.sourceCode;

            const viewInstances = await ViewInstance.find({viewTemplate: template._id});
            const isInUse = viewInstances.length > 0;

            res({
                template,
                sourceCode,
                viewInstances,
                isInUse
            })

        } catch (error) {
            console.error('Error fetching template or source code:', error);
            if (error.response && error.response.status) {
                rej({
                    code: error.response.status,
                    message: error.message
                })
            } else {
                rej({
                    code: httpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'Something went wrong'
                })
            }
        }
    });
}

const getTemplate = async (req, res) => {
    const {templateId} = req.params;
    if (!templateId) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'templateId must be present'});
    }

    getDetailedTemplateInformation(templateId)
        .then(templateDetails => {
            res.status(httpStatusCodes.OK).json(templateDetails);
        })
        .catch(error => {
            res.status(error.code).json({message: error.message});
        })
};

const deleteTemplateViewBasedOnId = templateId => {
    return new Promise(async (res, rej) => {
        try {
            const deletedTemplate = await ViewTemplate.findByIdAndDelete(templateId);
            if (!deletedTemplate) {
                rej({
                    code: httpStatusCodes.NOT_FOUND,
                    message: 'ViewTemplate not found.'
                });
            } else {
                res({
                    code: httpStatusCodes.OK,
                    message: 'ViewTemplate successfully deleted.'
                })
            }
        } catch (error) {
            console.error('Error deleting ViewTemplate:', error);
            rej({
                code: httpStatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Internal server error.'
            });
        }
    })
}

const deleteViewTemplate = (req, res) => {
    const {templateId} = req.params;
    if (!templateId) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'templateId must be present'});
    }
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
        return res.status(httpStatusCodes.BAD_REQUEST).send({message: 'Invalid ID format.'});
    }

    getDetailedTemplateInformation(templateId)
        .then(templateDetails => {
            if (templateDetails.isInUse) {
                res.status(httpStatusCodes.BAD_REQUEST).json({message: 'View Template is in use and cannot be deleted'})
            } else {
                deleteTemplateViewBasedOnId(templateId)
                    .then((result) => {
                        res.status(result.code).json({message: result.message});
                    })
                    .catch(errResult => {
                        res.status(errResult.code).json({message: errResult.message});
                    })
            }
        })
        .catch(error => {
            res.status(error.code).json({message: 'View Template could not be deleted: ' + error.message});
        })
}

module.exports = {
    createNewViewTemplate,
    getAllTemplates,
    getTemplate,
    deleteViewTemplate
}