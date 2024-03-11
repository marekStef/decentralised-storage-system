require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const httpStatusCodes = require("../constants/httpStatusCodes");
const {ViewTemplate} = require('../database/models/ViewTemplateSchema');
const {allowedRuntimes} = require('../constants/viewsRelated');

const isAllowedRuntime = runtime => {
    return allowedRuntimes.includes(runtime);
}

const cleanFiles = files => {
    files.forEach(file => {
        fs.unlinkSync(file.path);
    });
}

// this is a multipart data request (due to those files being uploaded) - so the things in the body are only texts! They need to be parsed individually
const createNewViewTemplate = async (req, res) => {
    const files = req.files;
    let { profiles, runtime, configuration } = req.body;

    console.log(profiles);

    try {
        profiles = JSON.parse(profiles)
    }
    catch (e) {
        console.log(e);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'Profiles is not a correct json array' });
    }

    try {
        configuration = JSON.parse(configuration);
    }
    catch (e) {
        console.log(e);
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'configuration is not a correct json object' });
    }


    if (!profiles || !runtime || !configuration) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({ message: 'All required fields must be present' });
    }

    if (!isAllowedRuntime(runtime)) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            message: `${runtime} is not an allowed runtime`,
            allowedRuntimes
        })
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
                configuration
            });

            await newViewTemplate.save(); // Save the new record to the database

            res.status(httpStatusCodes.CREATED).send({sourceCodeId: sourceCodeId, viewTemplateId: newViewTemplate._id});
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

module.exports = {
    createNewViewTemplate,
    deleteViewTemplate
}