const mongoose = require('mongoose');
const axios = require('axios');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {ViewTemplate} = require('../database/models/ViewTemplateSchema');
const ViewInstance = require("../database/models/ViewInstanceSchema");
const {allowedRuntimes} = require('../constants/viewsRelated');

const JAVASCRIPT_RUNTIME = 'javascript';
const PYTHON_RUNTIME = 'python';

const createNewViewInstance = async (req, res) => {
    const { viewTemplateId, jwtTokenForPermissionRequestsAndProfiles, configuration } = req.body;

    // Simple validation
    if (!viewTemplateId || !jwtTokenForPermissionRequestsAndProfiles || !configuration) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'viewTemplateId, configuration and jwtTokenForPermissionRequestsAndProfiles are required' });
    }

    console.log(configuration);
    try {
        JSON.stringify(configuration);
    }
    catch (e) {
        console.log(e);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'configuration is not a correct json object' });
    }

    if (!mongoose.Types.ObjectId.isValid(viewTemplateId))
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'viewTemplateId is not a correct id' });

    let viewTemplate;

    try {
        // Check if the ViewTemplate exists
        viewTemplate = await ViewTemplate.findById(viewTemplateId);
        if (!viewTemplate) {
            return res.status(httpStatusCodes.NOT_FOUND).json({ message: 'ViewTemplate not found' });
        }
    }
    catch (error) {
        console.error('Error looking for view template:', error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Could not fetch info about view template' });
    }
    
    accessTokensToProfiles = {}

    for (const profileItem of viewTemplate.profiles) {
        const permissionsRequest = {
            jwtTokenForPermissionRequestsAndProfiles,
            permissionsRequest: {
                profile: profileItem.profile,
                read: profileItem.read,
                create: profileItem.create,
                modify: profileItem.modify,
                delete: profileItem.delete,
            },
            optionalMessage: `This is request is part of new view instance creation for '${viewTemplate.templateName}' View Template`
        };

        console.log(permissionsRequest);

        try {
            const response = await axios.post(`${process.env.AUTH_SERVICE_URI}/app/api/requestNewPermission`, permissionsRequest);

            if (response.status === httpStatusCodes.CREATED) {
                accessTokensToProfiles[profileItem.profile] = response.data.generatedAccessToken;
            } else {
                return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Permissions for given view instance could not be created' });
            }
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                console.error('Error trying to ask for permission request:', error.response.data.message);
                return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({message: `authService says: ${error.response.data.message}`});
            } else {
                console.error('Network or other error:', error.message);
                return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create new view instance (couldn`t ask for permissions)'});
            }
        }
    }

    try {
        const viewInstance = new ViewInstance({
            viewTemplate: viewTemplate._id,
            accessTokensToProfiles,
            configuration
        });
    
        await viewInstance.save();
        return res.status(httpStatusCodes.CREATED).json(viewInstance);
    }
    catch (err) {
        console.log(err);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong during saving of new view instance' });
    }
};

const prepareDataForExecutionService = (accessTokensToProfiles, configuration, clientCustomData, authServiceEndpoint) => {
    return { accessTokensToProfiles, configuration, clientCustomData, authServiceEndpoint }
}

const executeViewInstanceSourceCodeBasedOnRuntime = async (res, runtime, sourceCodeId, parametersForMainEntry) => {
    let executionServiceUrl = null;
    
    if (runtime == JAVASCRIPT_RUNTIME) {
        executionServiceUrl = process.env.JAVASCRIPT_EXECUTION_SERVICE_URI;

    } else if (runtime == PYTHON_RUNTIME) {
        executionServiceUrl = process.env.PYTHON_EXECUTION_SERVICE_URI;
    }
    else { // unknown runtime (this should not happen as such view template should not be allowed to be created)
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'Bad runtime' });
    }

    try {
        const response = await axios.post(
            `${executionServiceUrl}/executeSourceCode/${sourceCodeId}`, 
            { parametersForMainEntry}
        );

        console.log(response);

        if (response.status === httpStatusCodes.OK) {
            res.status(httpStatusCodes.OK).json({
                message: response.data.message,
                result: response.data.result
            })
        } else {
            res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: response.message });
        }
    }
    catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.error('Error trying to run source code:', error.response.data.message);
            return res.status(httpStatusCodes.BAD_REQUEST).send({message: `runtime service says: ${error.response.data.message}`});
        } else {
            console.error('Network or other error:', error.message);
            return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to run given view - execution service seems to be down'});
        }
    }
}

const runViewInstance = async (req, res) => {
    const { viewInstanceId, clientCustomData } = req.body;

    if (!viewInstanceId || !clientCustomData) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'viewInstanceId and clientCustomData are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(viewInstanceId))
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'viewInstanceId is not a correct id' });

    let viewInstance = null;

    try {
        viewInstance = await ViewInstance.findById(viewInstanceId)
            .populate('viewTemplate')
            .exec();
    } catch (error) {
        console.error('Error fetching ViewInstance with populated ViewTemplate:', error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching ViewInstance' });
    }

    if (!viewInstance) {
        return res.status(httpStatusCodes.NOT_FOUND).json({ message: 'ViewInstance not found' });
    }
    
    try {
        const {sourceCodeId, metadata } = viewInstance.viewTemplate;
        const runtime = metadata.runtime;

        await executeViewInstanceSourceCodeBasedOnRuntime(
            res,
            runtime, 
            sourceCodeId, 
            prepareDataForExecutionService(viewInstance.accessTokensToProfiles, viewInstance.configuration, clientCustomData, authServiceEndpoint = process.env.AUTH_SERVICE_URI)
        );
    }
    catch (err) {
        console.log(err);
        res.status(err.statusCode).json({ message: err.message });
    }
}

const getViewInstanceDetails = async (req, res) => {
    const { viewInstanceId } = req.params;

    try {
        let viewInstance = await ViewInstance.findById(viewInstanceId)
            .populate('viewTemplate')
            .exec();

        res.status(httpStatusCodes.OK).json(viewInstance);
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
}
module.exports = {
    createNewViewInstance,
    runViewInstance,
    getViewInstanceDetails
}