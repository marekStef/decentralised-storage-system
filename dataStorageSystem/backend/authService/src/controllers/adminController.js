const mongoose = require('mongoose');

const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const adminResponseMessages = require('../constants/forApiResponses/admin/responseMessages');
const generalResponseMessages = require('../constants/forApiResponses/general');
const mongoDbCodes = require('../constants/mongoDbCodes');
const {generateBadResponse} = require('./helpers/generalHelpers');

const ApplicationSchema = require('../database/models/applicationRelatedModels/ApplicationSchema')
const OneTimeAssociationToken = require('../database/models/applicationRelatedModels/OneTimeAssociationTokenForApplication');
const DataAccessPermissionSchema = require('../database/models/dataAccessRelatedModels/DataAccessPermissionSchema');
const { DEFAULT_NUMBER_OF_ITEMS_PER_PAGE, DEFAULT_PAGE_NUMBER_ZERO_INDEXED} = require('../constants/pagination');

const getAllApps = async (req, res) => {
    const BASE = 10;

    const pageIndex = parseInt(req.query.page, BASE) || DEFAULT_PAGE_NUMBER_ZERO_INDEXED;
    const limit = parseInt(req.query.limit, BASE) || DEFAULT_NUMBER_OF_ITEMS_PER_PAGE;
    const skip = pageIndex * limit;

    try {
        const apps = await ApplicationSchema.find()
            .skip(skip)
            .limit(limit);

        const totalItems = await ApplicationSchema.countDocuments({ approvedDate: null });
        const totalPages = Math.ceil(totalItems / limit);

        res.status(httpStatusCodes.OK).json({
            status: 'success',
            data: apps,
            totalItems,
            totalPages,
            currentPage: pageIndex
        });
    } catch (error) {
        console.error('Error fetching apps:', error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
}

const getAppHolderById = async (req, res) => {
    const { appHolderId } = req.params;
    console.log(appHolderId);

    try {
        const app = await ApplicationSchema.findById(appHolderId);

        if (!app) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                status: 'error',
                message: 'App not found'
            });
        }

        res.status(httpStatusCodes.OK).json({
            status: 'success',
            data: app
        });
    } catch (error) {
        console.error(`Error fetching app with ID ${appHolderId}:`, error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
}

const createNewAppConnection = async (req, res) => {
    const { nameDefinedByUser } = req.body;

    if (!nameDefinedByUser) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_REQUIRED)
    }

    try {
        console.log(nameDefinedByUser);
        const newApplication = new ApplicationSchema({ nameDefinedByUser });
        
        const savedApplication = await newApplication.save();

        res.status(httpStatusCodes.CREATED).json({
            message: adminResponseMessages.success.APPLICATION_REGISTERED,
            appHolderId: savedApplication._id
        });
    } catch (error) {
        console.log(error);
        if (error.code === mongoDbCodes.DUPLICATE_ERROR) {
            console.log('here@0');
            return generateBadResponse(res, httpStatusCodes.CONFLICT, adminResponseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_ALREADY_EXISTING);
        }

        console.log(error)

        // other possible errors
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, adminResponseMessages.error.APPLICATION_REGISTRATION_FAILED);
    }
}

// returns bool whether the app holder created by user has been already associated with the real software application
const isAppAlreadyAssociated = app => {
    return app.dateOfAssociationByApp !== null
}

// function for generating one-time association token 
// which the real software app will use to associate itself with its app holder in storage system

const generateOneTimeTokenForAssociatingRealAppWithAppConnection = async (req, res) => {
    console.log(req.body);
    const { appHolderId } = req.body; // assuming the app's ID is passed as 'appHolderId'

    if (!appHolderId) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.APP_ID_NOT_PROVIDED);
    }

    if (!mongoose.Types.ObjectId.isValid(appHolderId))
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.INVALID_APP_HOLDER_FORMAT);

    try {
        const app = await ApplicationSchema.findById(appHolderId);

        if (!app)
            return generateBadResponse(res, httpStatusCodes.NOT_FOUND, adminResponseMessages.error.APPLICATION_NOT_FOUND);

        if (isAppAlreadyAssociated(app))
            return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.APPLICATION_HOLDER_ALREADY_ASSOCIATED_WITH_PHYSICAL_APP);

        const existingToken = await OneTimeAssociationToken.findOne({ app: appHolderId });
        // there should not be existing token - only one token for association can be generated
        if (existingToken) {
            // return it
            res.status(httpStatusCodes.CREATED).json({
                message: adminResponseMessages.success.ONE_TIME_ASSOCIATION_TOKEN_CREATED,
                tokenId: existingToken._id
            });
            // return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.ASSOCIATION_TOKEN_ALREADY_CREATED);
        }

        // All checks passed, generate new token
        const newToken = new OneTimeAssociationToken({ app: appHolderId });
        await newToken.save();

        res.status(httpStatusCodes.CREATED).json({
            message: adminResponseMessages.success.ONE_TIME_ASSOCIATION_TOKEN_CREATED,
            tokenId: newToken._id
        });

    } catch (error) {
        console.error(adminResponseMessages.error.ASSOCIATION_TOKEN_GENERATING_FAILED + ": " + error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: generalResponseMessages.INTERNAL_SERVER_ERROR });
    }
};

const getUnapprovedPermissionsRequests = async (req, res) => {
    const BASE = 10;

    const pageIndex = parseInt(req.query.pageIndex, BASE) || DEFAULT_PAGE_NUMBER_ZERO_INDEXED;
    const limit = parseInt(req.query.limit, BASE) || DEFAULT_NUMBER_OF_ITEMS_PER_PAGE;
    const skip = pageIndex * limit;

    try {
        const permissions = await DataAccessPermissionSchema.find({ approvedDate: null })
            .skip(skip)
            .limit(limit)
            .populate('app');

        const totalItems = await DataAccessPermissionSchema.countDocuments({ approvedDate: null });
        const totalPages = Math.ceil(totalItems / limit);

        res.status(httpStatusCodes.OK).json({
            status: 'success',
            data: {
                permissions,
                totalItems,
                totalPages,
                currentPage: pageIndex
            }
        });
    } catch (error) {
        console.error('Error fetching unapproved permissions requests:', error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

const getAllPermissionsForGivenApp = async (req, res) => {
    const { appHolderId } = req.params;

    try {
        const permissions = await DataAccessPermissionSchema.find({ app: appHolderId })
            .populate('app');

        res.status(httpStatusCodes.OK).json({
            status: 'success',
            permissions
        });
    } catch (error) {
        console.error('Error fetching permissions for the app:', error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

const approvePermissionRequest = async (req, res) => {
    const { permissionId } = req.body; // Extracting the permission ID from the request body

    if (!permissionId) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.PERMISSION_ID_REQUIRED);
    }

    // Check if the permissionId is a valid mongo db ObjectId
    if (!mongoose.Types.ObjectId.isValid(permissionId))
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.INVALID_PERMISSION_ID_FORMAT);

    const existingPermission = await DataAccessPermissionSchema.findById(permissionId);
    if (!existingPermission)
        return generateBadResponse(res, httpStatusCodes.NOT_FOUND, adminResponseMessages.error.PERMISSION_REQUEST_NOT_FOUND);
    if (existingPermission.isActive && existingPermission.approvedDate) // Permission is already active and has an approved date
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.PERMISSION_ALREADY_APPROVED);

    try {
        // Find the permission by ID and update
        const updatedPermission = await DataAccessPermissionSchema.findByIdAndUpdate(
            permissionId,
            {
                $set: {
                    isActive: true,
                    approvedDate: new Date()
                }
            },
            { new: true } // Return the modified document rather than the original
        );

        res.status(httpStatusCodes.OK).json({
            message: adminResponseMessages.success.PERMISSION_REQUEST_APPROVED,
            data: updatedPermission
        });
    } catch (error) {
        console.error('Error approving permission request:', error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

const revokeApprovedPermission = async (req, res) => {
    const { permissionId } = req.body;

    if (!permissionId)
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.PERMISSION_ID_REQUIRED);

    // Check if the permissionId is a valid mongo db ObjectId
    if (!mongoose.Types.ObjectId.isValid(permissionId))
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.INVALID_PERMISSION_ID_FORMAT);

    const existingPermission = await DataAccessPermissionSchema.findById(permissionId);
    if (!existingPermission)
        return generateBadResponse(res, httpStatusCodes.NOT_FOUND, adminResponseMessages.error.PERMISSION_REQUEST_NOT_FOUND);
    if (existingPermission.revokedDate) // Permission was already revoked
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.PERMISSION_ALREADY_REVOKED);

    try {
        const updatedPermission = await DataAccessPermissionSchema.findByIdAndUpdate(
            permissionId,
            {
                $set: {
                    isActive: false,
                    revokedDate: new Date() // Setting the current date as the revoked date
                }
            },
            { new: true } // Return the modified document rather than the original
        );

        res.status(httpStatusCodes.OK).json({
            message: adminResponseMessages.success.PERMISSION_REVOKED_SUCCESS,
            data: updatedPermission
        });
    } catch (error) {
        console.error('Error revoking permission request:', error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

module.exports = { 
    getAllApps,
    getAppHolderById,
    createNewAppConnection,
    generateOneTimeTokenForAssociatingRealAppWithAppConnection,
    getUnapprovedPermissionsRequests,
    getAllPermissionsForGivenApp,
    approvePermissionRequest,
    revokeApprovedPermission
};