const mongoose = require('mongoose');
const axios = require('axios');

const logger = require('../logger/winston');

const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');
const adminResponseMessages = require('../constants/forApiResponses/admin/responseMessages');
const generalResponseMessages = require('../constants/forApiResponses/general');
const mongoDbCodes = require('../constants/mongoDbCodes');
const { generateBadResponse } = require('./helpers/generalHelpers');

const ApplicationSchema = require('../database/models/applicationRelatedModels/ApplicationSchema')
const OneTimeAssociationToken = require('../database/models/applicationRelatedModels/OneTimeAssociationTokenForApplication');
const DataAccessPermissionSchema = require('../database/models/dataAccessRelatedModels/DataAccessPermissionSchema');
const ViewAccessSchema = require('../database/models/viewsRelatedModels/ViewAccessSchema');

const { DEFAULT_NUMBER_OF_ITEMS_PER_PAGE, DEFAULT_PAGE_NUMBER_ZERO_INDEXED } = require('../constants/pagination');

const { generateTokenForViewAccess, decodeTokenForViewAccess } = require('./helpers/viewAccessHelpers');

/**
 * Get all applications with pagination.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.page - The page number (zero-indexed).
 * @param {string} req.query.limit - The number of items per page.
 * @param {Object} res - The response object.
 */
const getAllApps = async (req, res) => {
    const BASE = 10;

    const pageIndex = parseInt(req.query.page, BASE) || DEFAULT_PAGE_NUMBER_ZERO_INDEXED;
    const limit = parseInt(req.query.limit, BASE) || DEFAULT_NUMBER_OF_ITEMS_PER_PAGE;
    const skip = pageIndex * limit;

    try {
        const apps = await ApplicationSchema.find()
            .sort({ dateOfRegistration: -1 }) // descending order
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
        logger.error('Error fetching apps: ' + error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
}

/**
 * Get App Holder by ID.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.appHolderId - The ID of the application holder.
 * @param {Object} res - The response object.
 */
const getAppHolderById = async (req, res) => {
    const { appHolderId } = req.params;

    try {
        const app = await ApplicationSchema.findById(appHolderId);

        if (!app) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                status: 'error',
                message: adminResponseMessages.error.APPLICATION_NOT_FOUND
            });
        }

        res.status(httpStatusCodes.OK).json({
            status: 'success',
            data: app
        });
    } catch (error) {
        logger.error(`Error fetching app with ID ${appHolderId}:` + error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
}

/**
 * Create a new application connection. This is basically where a new app holder is created for a new application. User needs to name this new app holder.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.nameDefinedByUser - The name defined by the user.
 * @param {Object} res - The response object.
 */
const createNewAppConnection = async (req, res) => {
    const { nameDefinedByUser } = req.body;

    if (!nameDefinedByUser) {
        return generateBadResponse(res, httpStatusCodes.BAD_REQUEST, adminResponseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_REQUIRED)
    }

    try {
        const newApplication = new ApplicationSchema({ nameDefinedByUser });

        const savedApplication = await newApplication.save();

        res.status(httpStatusCodes.CREATED).json({
            message: adminResponseMessages.success.APPLICATION_REGISTERED,
            appHolderId: savedApplication._id
        });
    } catch (error) {
        logger.error(error);
        if (error.code === mongoDbCodes.DUPLICATE_ERROR) {
            return generateBadResponse(res, httpStatusCodes.CONFLICT, adminResponseMessages.error.APPLICATION_NAME_DEFINED_BY_USER_ALREADY_EXISTING);
        }

        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, adminResponseMessages.error.APPLICATION_REGISTRATION_FAILED);
    }
}

/**
 * Check if the application holder is already associated with a real software application.
 * 
 * @param app
 * @returns {boolean} True if the application is already associated, otherwise false.
 */
const isAppAlreadyAssociated = app => {
    return app.dateOfAssociationByApp !== null
}

/**
 * Generate a one-time association token which the real software app will use to associate itself with its app holder in storage system
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.appHolderId - The ID of the app holder.
 * @param {Object} res - The response object.
 */
const generateOneTimeTokenForAssociatingRealAppWithAppConnection = async (req, res) => {
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
            return res.status(httpStatusCodes.CREATED).json({
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
        logger.error(adminResponseMessages.error.ASSOCIATION_TOKEN_GENERATING_FAILED + ": " + error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: generalResponseMessages.INTERNAL_SERVER_ERROR });
    }
};

/**
 * Get all unapproved permissions requests with pagination.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.pageIndex - The page number (zero-indexed).
 * @param {string} req.query.limit - The number of items per page.
 * @param {Object} res - The response object.
 */
const getUnapprovedPermissionsRequests = async (req, res) => {
    const BASE = 10;

    const pageIndex = parseInt(req.query.pageIndex, BASE) || DEFAULT_PAGE_NUMBER_ZERO_INDEXED;
    const limit = parseInt(req.query.limit, BASE) || DEFAULT_NUMBER_OF_ITEMS_PER_PAGE;
    const skip = pageIndex * limit;

    try {
        const permissions = await DataAccessPermissionSchema.find({ approvedDate: null })
            .sort({ createdDate: -1 }) // descending order
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
        logger.error('Error fetching unapproved permissions requests:', error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Get all permissions for a given application.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.params.appHolderId - The ID of the app holder.
 * @param {Object} res - The response object.
 */
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
        logger.error('Error fetching permissions for the app:' + error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Approve a permission request which was requested by some third party application.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.body.permissionId - The ID of the permission to approve.
 * @param {Object} res - The response object.
 */
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
        logger.error('Error approving permission request:' + error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Revoke an already approved permission.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.body.permissionId - The ID of the permission to revoke.
 * @param {Object} res - The response object.
 */
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
        logger.error('Error revoking permission request:' + error);
        return generateBadResponse(res, httpStatusCodes.INTERNAL_SERVER_ERROR, generalResponseMessages.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Get all view accesses.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getAllViewsAccesses = async (req, res) => {
    try {
        const viewAccesses = await ViewAccessSchema.find({});
        res.status(httpStatusCodes.OK).json(viewAccesses);
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};

/**
 * Get all view accesses for a given application.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.params.appHolderId - The ID of the application holder.
 * @param {Object} res - The response object.
 */
const getAllViewsAccessesForGivenApp = async (req, res) => {
    const { appHolderId } = req.params;

    try {
        let viewAccesses = await ViewAccessSchema.find({ app: appHolderId });

        const viewAccessPromises = viewAccesses.map(async viewAccess => {
            const responseFromViewManager = await axios.get(`${process.env.VIEW_MANAGER_URL}/viewInstances/${viewAccess.viewInstanceId}`);

            if (responseFromViewManager.status !== httpStatusCodes.OK) {
                throw new Error(`Unexpected response status: ${responseFromViewManager.status}`); // to break out of the Promise.all
            }

            const viewAccessToken = generateTokenForViewAccess(viewAccess.viewInstanceId, appHolderId, viewAccess._id)

            return {
                viewAccessId: viewAccess._id.toString(),
                viewAccessName: viewAccess.viewAccessName,
                viewAccessToken,
                viewInstanceId: viewAccess.viewInstanceId,
                createdDate: viewAccess.createdDate,
                viewInstance: responseFromViewManager.data
            };
        });


        const enhancedViewAccesses = await Promise.all(viewAccessPromises); // waiting for all promises to be resolved

        res.status(httpStatusCodes.OK).json({ viewAccesses: enhancedViewAccesses });
    } catch (error) {
        logger.error('Error fetching view accesses:' + error.message);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
}

module.exports = {
    getAllApps,
    getAppHolderById,
    createNewAppConnection,
    generateOneTimeTokenForAssociatingRealAppWithAppConnection,
    getUnapprovedPermissionsRequests,
    getAllPermissionsForGivenApp,
    approvePermissionRequest,
    revokeApprovedPermission,
    getAllViewsAccesses,
    getAllViewsAccessesForGivenApp
};