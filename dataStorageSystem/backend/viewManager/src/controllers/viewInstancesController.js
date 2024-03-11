const mongoose = require('mongoose');
const axios = require('axios');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {ViewTemplate} = require('../database/models/ViewTemplateSchema');
const ViewInstance = require("../database/models/ViewInstanceSchema");


const createNewViewInstance = async (req, res) => {
    const { viewTemplateId, jwtTokenForPermissionRequestsAndProfiles } = req.body;

    // Simple validation
    if (!viewTemplateId || !jwtTokenForPermissionRequestsAndProfiles) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'viewTemplateId and jwtTokenForPermissionRequestsAndProfiles are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(viewTemplateId))
        return res.status(httpStatusCodes.BAD_REQUEST).json({message: 'viewTemplateId is not a correct id' });

    let viewTemplate;

    try {
        // Check if the ViewTemplate exists
        viewTemplate = await ViewTemplate.findById(viewTemplateId);
        if (!viewTemplate) {
            return res.status(404).json({ message: 'ViewTemplate not found' });
        }
    }
    catch (error) {
        console.error('Error looking for view template:', error);
        return res.status(500).json({ message: 'Could not fetch info about view template' });
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
        };

        console.log(permissionsRequest);

        try {
            const response = await axios.post(`${process.env.AUTH_SERVICE_URI}/app/api/request_new_permissions`, permissionsRequest);

            if (response.status === 201) {
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
            accessTokensToProfiles
        });
    
        await viewInstance.save();
        return res.status(httpStatusCodes.CREATED).json(viewInstance);
    }
    catch (err) {
        console.log(err);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong during saving of new view instance' });
    }


    
};

module.exports = {
    createNewViewInstance
}