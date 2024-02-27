module.exports = {
    error: {
        APPLICATION_NAME_DEFINED_BY_USER_REQUIRED: "Application name is required.",
        APPLICATION_NAME_DEFINED_BY_USER_ALREADY_EXISTING: "An application with this name defined by user already exists.",
        APPLICATION_REGISTRATION_FAILED: "Failed to register the new application.",

        APP_ID_NOT_PROVIDED: "App ID must be provided",
        INVALID_APP_HOLDER_FORMAT: "Invalid appHolderId format",
        APPLICATION_NOT_FOUND: "Application not found",
        APPLICATION_HOLDER_ALREADY_ASSOCIATED_WITH_PHYSICAL_APP: "Application has already been associated",

        ASSOCIATION_TOKEN_ALREADY_CREATED: "An association token for this application already exists",
        ASSOCIATION_TOKEN_GENERATING_FAILED: "Error generating one-time association token",

        PERMISSION_ID_REQUIRED: "Permission ID is required to approve permission request",
        PERMISSION_REQUEST_NOT_FOUND: "Permission request not found",
        PERMISSION_ALREADY_APPROVED: "Permission request was already approved",

        INVALID_PERMISSION_ID_FORMAT: "Invalid permission ID format",
        PERMISSION_ALREADY_REVOKED: "Permission was already revoked"
    },
    success: {
        APPLICATION_REGISTERED: "Application registered successfully.",

        ONE_TIME_ASSOCIATION_TOKEN_CREATED: "One-time association token generated successfully",

        PERMISSION_REQUEST_APPROVED: "Permission request approved successfully",
        PERMISSION_REVOKED_SUCCESS: "Permission revoked successfully"
    }
};