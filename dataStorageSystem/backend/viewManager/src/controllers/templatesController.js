require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const mongoose = require('mongoose');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {ViewTemplate} = require('../database/models/ViewTemplateSchema');
const ViewInstance = require('../database/models/ViewInstanceSchema');
const {isAllowedRuntime} = require('../constants/viewsRelated');
const {allowedRuntimes, getExecutionServiceUrlBasedOnSelectedRuntime} = require('../constants/viewsRelated');

/**
 * Deletes files from the file system.
 * @param {Array} files - Array of file objects to be deleted.
 */
const cleanFiles = files => {
    files.forEach(file => {
        fs.unlinkSync(file.path);
    });
}

/**
 * Constructs the endpoint URL for uploading new source code to the execution service.
 * @param {string} runtime - The runtime environment for which the source code is uploaded.
 * @returns {string} - The complete endpoint URL for uploading new source code.
 */
const getExecutionServiceEndpointForUploadingNewSourceCode = runtime => {
    return `${getExecutionServiceUrlBasedOnSelectedRuntime(runtime)}/uploadNewSourceCode`;
}

/**
 * Constructs the endpoint URL for retrieving specific source code from the execution service.
 * @param {string} runtime - The runtime environment for the source code.
 * @param {string} sourceCodeId - The unique identifier for the source code.
 * @returns {string} - The complete endpoint URL for retrieving the source code.
 */
const getExecutionServiceEndpointForGettingGivenSourceCode = (runtime, sourceCodeId) => {
    return `${getExecutionServiceUrlBasedOnSelectedRuntime(runtime)}/sourceCodes/${sourceCodeId}`;
}

/**
 * Constructs the endpoint URL for deleting specific source code from the execution service.
 * @param {string} runtime - The runtime environment for the source code.
 * @param {string} sourceCodeId - The unique identifier for the source code.
 * @returns {string} - The complete endpoint URL for deleting the source code.
 */
const getExecutionServiceEndpointForDeletingGivenSourceCode = (runtime, sourceCodeId) => {
    return `${getExecutionServiceUrlBasedOnSelectedRuntime(runtime)}/sourceCodes/${sourceCodeId}`;
}


/**
 * Creates a new view template by uploading the source code and saving template details in the database.
 * @param {object} req - The request object containing files and body data which includes `profiles`, `runtime` and `templateName`.
 * @param {object} res - The response object used to send back the appropriate HTTP response.
 */
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
        const response = await axios.post(getExecutionServiceEndpointForUploadingNewSourceCode(runtime), formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        cleanFiles(files);

        if (response.status === httpStatusCodes.CREATED) {
            const sourceCodeId = response.data.sourceCodeId;

            const newViewTemplate = new ViewTemplate({
                sourceCodeId: sourceCodeId,
                metadata: { runtime },
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

/**
 * Retrieves all view templates from the database and sends them in the response.
 * @param {object} req - The request object.
 * @param {object} res - The response object used to send back the appropriate HTTP response.
 */
const getAllTemplates = async (req, res) => {
    try {
        const viewTemplates = await ViewTemplate.find({}).sort({createdDate: -1}); //sort in descending order

        res.status(httpStatusCodes.OK).json({viewTemplates});
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};

/**
 * Retrieves detailed information for a specific View Template.
 * @param {string} templateId - The unique identifier for the template.
 * @returns A promise that resolves with the template details, including source code and view instances.
 */
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

            const executionServerEndpoint = getExecutionServiceEndpointForGettingGivenSourceCode(template.metadata.runtime, template.sourceCodeId);
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

/**
 * Retrieves a specific View Template by ID and sends the detailed template details in the response.
 * @param {object} req - The request object containing the templateId parameter.
 * @param {object} res - The response object used to send back the appropriate HTTP response.
 */
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

/**
 * Deletes a specific View Template and its associated source code in the given execution service based on the template's selected runtime.
 * @param {string} templateId - The unique identifier for the template to be deleted.
 * @returns {Promise<object>} - A promise that resolves with the result of the deletion operation.
 */
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
                // now delete the view template's source code in the respective execution service
                const executionEndpointForSourceCodeDeletion = getExecutionServiceEndpointForDeletingGivenSourceCode(deletedTemplate.metadata.runtime, deletedTemplate.sourceCodeId);
                const response = await axios.delete(executionEndpointForSourceCodeDeletion);
                if (response.status == httpStatusCodes.OK) {
                    res({
                        code: httpStatusCodes.OK,
                        message: 'ViewTemplate successfully deleted.'
                    })
                } else {
                    res({
                        code: httpStatusCodes.INTERNAL_SERVER_ERROR,
                        message: 'View Template was successfully deleted in the ViewManager component but the source code failed to be deleted in the execution service'
                    })
                }
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

/**
 * Handles the deletion of a view template by ID after ensuring it is not in use.
 * @param {object} req - The request object containing the `templateId` parameter in `req.params`.
 * @param {object} res - The response object used to send back the appropriate HTTP response.
 */
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